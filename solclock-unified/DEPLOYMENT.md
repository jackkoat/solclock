# SolClock Deployment Guide

## Production Deployment Options

### Option 1: Vercel (Recommended) ⭐

Vercel is the optimal choice for Next.js applications with zero configuration.

#### Steps:
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/solclock.git
   git push -u origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Configure Environment Variables**
   In Vercel project settings, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ifkdvtrhpvavgmkwlcxm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get production URL: `https://solclock.vercel.app`

#### Advantages:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic CI/CD
- ✅ Zero configuration
- ✅ Free tier available
- ✅ Serverless functions work out-of-the-box

---

### Option 2: Self-Hosted (VPS/Cloud)

Deploy on your own server with Node.js.

#### Requirements:
- Node.js 18+ (20+ recommended)
- pnpm or npm
- Reverse proxy (Nginx/Caddy)

#### Steps:

1. **Server Setup**
   ```bash
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install pnpm
   npm install -g pnpm
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/solclock.git
   cd solclock
   
   # Install dependencies
   pnpm install
   
   # Create .env.local
   cat > .env.local << EOF
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   EOF
   
   # Build
   pnpm run build
   
   # Start with PM2
   pnpm install -g pm2
   pm2 start npm --name "solclock" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name solclock.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable HTTPS with Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d solclock.yourdomain.com
   ```

#### Advantages:
- ✅ Full control
- ✅ Custom domain
- ✅ Cost-effective for high traffic
- ❌ Requires manual setup and maintenance

---

### Option 3: Docker Deployment

Containerized deployment for consistent environments.

#### Dockerfile
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  solclock:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

#### Deploy
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Advantages:
- ✅ Consistent environment
- ✅ Easy scaling
- ✅ Portable
- ❌ Requires Docker knowledge

---

### Option 4: Netlify

Alternative serverless platform.

#### Steps:
1. Install Netlify CLI
   ```bash
   npm install -g netlify-cli
   ```

2. Configure `netlify.toml`
   ```toml
   [build]
     command = "pnpm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. Deploy
   ```bash
   netlify deploy --prod
   ```

4. Add environment variables in Netlify dashboard

---

## Post-Deployment Checklist

### ✅ Essential Tasks

1. **Verify Environment Variables**
   - All Supabase credentials are set
   - No sensitive keys in client code

2. **Test API Endpoints**
   ```bash
   curl https://your-domain.com/api/network/stats
   curl https://your-domain.com/api/top-meme
   ```

3. **Trigger Initial Data Fetch**
   ```bash
   curl -X POST https://your-domain.com/api/refresh
   ```

4. **Verify Cron Job**
   - Check Supabase Dashboard → Edge Functions
   - Verify `cron-update-data` is active
   - Check execution logs

5. **Test Dashboard**
   - Visit homepage
   - Check Network Pulse chart loads
   - Verify Top 50 Meme Coins table
   - Test responsive design on mobile

### 🔍 Monitoring

1. **Supabase Logs**
   - Monitor edge function execution
   - Check for API errors

2. **Application Logs**
   - Vercel: Dashboard → Logs
   - Self-hosted: `pm2 logs solclock`
   - Docker: `docker-compose logs -f`

3. **Performance**
   - Use Vercel Analytics (if on Vercel)
   - Set up Sentry for error tracking (optional)

### 🔐 Security

1. **Environment Variables**
   - Never commit `.env.local` to Git
   - Use platform-specific secret management

2. **API Rate Limiting**
   - Solana RPC: Consider paid tier for high traffic
   - DexScreener: Monitor API usage

3. **CORS**
   - Edge functions have CORS enabled
   - Verify allowed origins in production

---

## Scaling Considerations

### Database
- **Current**: Supabase free tier (500MB, 2GB transfer)
- **Scaling**: Upgrade to Pro ($25/mo) for more resources

### Edge Functions
- **Current**: 500k invocations/month (free tier)
- **Scaling**: Pro plan for unlimited invocations

### Cron Jobs
- **Current**: Hourly updates (720 runs/month)
- **Optimization**: Adjust frequency based on traffic

### CDN
- **Vercel**: Global edge network included
- **Self-hosted**: Consider Cloudflare CDN

---

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

### Runtime Errors
1. Check environment variables are set
2. Verify Supabase connection
3. Check edge function logs
4. Test API endpoints individually

### Data Not Updating
1. Manually trigger: `POST /api/refresh`
2. Check cron job status in Supabase
3. Verify edge function has correct permissions

### Performance Issues
1. Enable Next.js caching in `next.config.mjs`
2. Optimize database queries
3. Add CDN for static assets
4. Consider Redis for caching (advanced)

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor API usage
- Verify data freshness

**Monthly:**
- Review database size
- Analyze performance metrics
- Update dependencies

**Quarterly:**
- Security audit
- Dependency updates
- Performance optimization

### Updates

```bash
# Update dependencies
pnpm update

# Update Next.js
pnpm add next@latest

# Update Supabase client
pnpm add @supabase/supabase-js@latest

# Rebuild and redeploy
pnpm run build
```

---

## Cost Estimate

### Vercel (Recommended)
- **Hobby Plan**: Free forever
  - 100GB bandwidth
  - Unlimited serverless functions
  - Perfect for this application

### Supabase
- **Free Tier**: $0/month
  - 500MB database
  - 2GB bandwidth
  - 500K edge function invocations
  - **Suitable for moderate traffic**

- **Pro Tier**: $25/month (if needed)
  - 8GB database
  - 250GB bandwidth
  - Unlimited edge functions

### Self-Hosted
- **VPS**: $5-20/month (Digital Ocean, Linode, Vultr)
- **Domain**: $10-15/year
- **Total**: ~$10-25/month

---

## Recommended Setup for Production

```
✅ Frontend & API: Vercel (Free tier)
✅ Database & Edge Functions: Supabase (Free tier)
✅ Domain: Namecheap/Cloudflare ($10-15/year)
✅ Total Cost: $0-15/year for small to medium traffic
```

---

## Support Resources

- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Solana**: https://docs.solana.com

---

**Last Updated**: 2025-11-12  
**Version**: 2.0.0  
**Author**: MiniMax Agent
