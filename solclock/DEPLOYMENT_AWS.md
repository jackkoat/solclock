# SolClock - AWS ECS Deployment Guide

This guide covers deploying SolClock to AWS using ECS (Elastic Container Service), RDS (PostgreSQL), and ElastiCache (Redis).

## Prerequisites

1. AWS Account with billing enabled
2. AWS CLI installed and configured
3. Docker installed locally
4. Basic knowledge of AWS services

## Architecture on AWS

```
CloudFront/S3 (Frontend)
       ↓
   ALB (Load Balancer)
       ↓
   ECS Fargate (Backend Containers)
       ↓
   RDS PostgreSQL  +  ElastiCache Redis
       ↓
   VPC with public/private subnets
```

## Estimated Monthly Cost

- **Development:** $30-50/month
- **Production:** $100-200/month (depends on traffic)

## Step 1: Setup VPC and Security Groups

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=solclock-vpc}]'

# Note the VPC ID, then create subnets
export VPC_ID=<your-vpc-id>

# Public subnet
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone us-east-1a

# Private subnet
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone us-east-1a

# Create Internet Gateway
aws ec2 create-internet-gateway
export IGW_ID=<your-igw-id>

# Attach to VPC
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
```

Or use the AWS Console:
1. VPC Dashboard → Create VPC
2. Choose "VPC and more" for automatic subnet creation
3. Name: `solclock-vpc`
4. CIDR: `10.0.0.0/16`
5. 2 Availability Zones, 2 public subnets, 2 private subnets

## Step 2: Create RDS PostgreSQL

1. **RDS Console** → Create database
2. Configuration:
   - **Engine:** PostgreSQL 15
   - **Template:** Free tier (or Production for real use)
   - **DB Instance:** `solclock-db`
   - **Master username:** `postgres`
   - **Master password:** (generate secure password)
   - **VPC:** `solclock-vpc`
   - **Public access:** No (for security)
   - **VPC security group:** Create new `solclock-db-sg`
   - **Initial database:** `solclock`

3. Wait 10-15 minutes for creation
4. Note the **Endpoint** (e.g., `solclock-db.xxxxx.us-east-1.rds.amazonaws.com`)

## Step 3: Create ElastiCache Redis

1. **ElastiCache Console** → Create Redis cluster
2. Configuration:
   - **Cluster engine:** Redis
   - **Name:** `solclock-redis`
   - **Node type:** `cache.t3.micro` (or `t4g.micro`)
   - **Number of replicas:** 0 (for dev) or 1-2 (for prod)
   - **VPC:** `solclock-vpc`
   - **Subnet group:** Create new with private subnets
   - **Security group:** Create new `solclock-redis-sg`

3. Note the **Primary Endpoint**

## Step 4: Build and Push Docker Images

### 4.1 Create ECR Repositories

```bash
# Backend repository
aws ecr create-repository --repository-name solclock/backend --region us-east-1

# Frontend repository (if using Docker for frontend)
aws ecr create-repository --repository-name solclock/frontend --region us-east-1

# Note the repository URIs
export BACKEND_REPO=<account-id>.dkr.ecr.us-east-1.amazonaws.com/solclock/backend
```

### 4.2 Build and Push Backend Image

```bash
cd backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $BACKEND_REPO

# Build image
docker build -t solclock-backend .

# Tag for ECR
docker tag solclock-backend:latest $BACKEND_REPO:latest

# Push to ECR
docker push $BACKEND_REPO:latest
```

## Step 5: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name solclock-cluster --region us-east-1
```

Or via Console:
1. ECS Dashboard → Clusters → Create cluster
2. Name: `solclock-cluster`
3. Infrastructure: AWS Fargate

## Step 6: Create Task Definition

Create file `task-definition.json`:

```json
{
  "family": "solclock-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<BACKEND_REPO>:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "PORT", "value": "4000" },
        { "name": "NODE_ENV", "value": "production" },
        { "name": "USE_REAL_DATA", "value": "true" },
        { "name": "SOLANA_RPC_ENDPOINT", "value": "https://api.mainnet-beta.solana.com" },
        { "name": "RPC_RATE_LIMIT", "value": "5" },
        { "name": "CACHE_TTL_SECONDS", "value": "300" },
        { "name": "LOG_LEVEL", "value": "info" }
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:solclock/db-host"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:solclock/db-password"
        },
        {
          "name": "REDIS_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:solclock/redis-host"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/solclock-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole"
}
```

Register task definition:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

## Step 7: Create Application Load Balancer

1. **EC2 Console** → Load Balancers → Create ALB
2. Configuration:
   - **Name:** `solclock-alb`
   - **Scheme:** Internet-facing
   - **VPC:** `solclock-vpc`
   - **Subnets:** Select public subnets
   - **Security group:** Create new (allow HTTP/HTTPS from 0.0.0.0/0)
3. Create **Target Group**:
   - **Name:** `solclock-backend-tg`
   - **Target type:** IP
   - **Protocol:** HTTP, Port 4000
   - **Health check path:** `/health`

## Step 8: Create ECS Service

```bash
aws ecs create-service \
  --cluster solclock-cluster \
  --service-name solclock-backend-service \
  --task-definition solclock-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT:targetgroup/solclock-backend-tg/xxx,containerName=backend,containerPort=4000"
```

## Step 9: Deploy Frontend to S3 + CloudFront

### 9.1 Build Frontend

```bash
cd frontend
npm run build
```

### 9.2 Create S3 Bucket

```bash
aws s3 mb s3://solclock-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://solclock-frontend --index-document index.html --error-document 404.html
```

### 9.3 Upload Build

```bash
aws s3 sync out/ s3://solclock-frontend --delete
```

### 9.4 Create CloudFront Distribution

1. CloudFront Console → Create Distribution
2. Origin:
   - **Origin domain:** `solclock-frontend.s3.us-east-1.amazonaws.com`
   - **Origin access:** Public
3. Default cache behavior: Redirect HTTP to HTTPS
4. Distribution settings:
   - **Price class:** Use all edge locations
   - **Alternate domain names:** Your custom domain (optional)
5. Create distribution
6. Note the **CloudFront URL**

## Step 10: Initialize Database

Run one-time setup:

```bash
# Get task ARN
aws ecs list-tasks --cluster solclock-cluster --service-name solclock-backend-service

# Execute command in running task
aws ecs execute-command \
  --cluster solclock-cluster \
  --task <task-arn> \
  --container backend \
  --interactive \
  --command "npm run init-db"

# Generate initial data
aws ecs execute-command \
  --cluster solclock-cluster \
  --task <task-arn> \
  --container backend \
  --interactive \
  --command "npm run generate-mock"
```

## Step 11: Setup Auto-Scaling (Optional)

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/solclock-cluster/solclock-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name solclock-cpu-scaling \
  --service-namespace ecs \
  --resource-id service/solclock-cluster/solclock-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Step 12: Setup Scheduled Tasks (Cron)

Create EventBridge rule to run data aggregation:

```bash
# Create rule (runs every hour)
aws events put-rule \
  --name solclock-data-aggregation \
  --schedule-expression "rate(1 hour)"

# Create ECS task target
aws events put-targets \
  --rule solclock-data-aggregation \
  --targets file://task-target.json
```

## Monitoring

### CloudWatch Dashboards
- View logs: `/ecs/solclock-backend`
- Metrics: CPU, Memory, Request count
- Set up alarms for errors

### Health Check
Visit: `http://<alb-dns-name>/health`

## Security Best Practices

1. ✅ Store secrets in AWS Secrets Manager
2. ✅ Use IAM roles for ECS tasks
3. ✅ Enable VPC Flow Logs
4. ✅ Use private subnets for database
5. ✅ Enable CloudTrail for audit logs
6. ✅ Use HTTPS only (ACM certificate)

## Cost Optimization

1. Use Fargate Spot for non-critical workloads
2. Enable S3 lifecycle policies
3. Use Reserved Instances for RDS
4. Set up Auto-Scaling to scale down during low traffic

## Troubleshooting

### Tasks not starting
- Check CloudWatch logs
- Verify IAM roles have necessary permissions
- Check security group rules

### Database connection issues
- Verify security groups allow traffic from ECS tasks
- Check VPC configuration

### High costs
- Review CloudWatch metrics
- Scale down during off-peak
- Use Fargate Spot

## Next Steps

1. ✅ Set up custom domain with Route 53
2. ✅ Enable SSL/TLS with ACM
3. ✅ Configure WAF for security
4. ✅ Set up backup policies
5. ✅ Implement CI/CD with GitHub Actions

---

**AWS Documentation:**
- [ECS Fargate Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [ElastiCache Redis](https://docs.aws.amazon.com/elasticache/)
