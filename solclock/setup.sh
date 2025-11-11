#!/bin/bash

# SolClock Quick Setup Script
# This script sets up SolClock for local development with Docker

set -e

echo "============================================"
echo "   SolClock - Quick Setup Script"
echo "============================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask user for data mode
echo "Choose data mode:"
echo "  1) Mock Data (recommended for development)"
echo "  2) Real Solana Blockchain Data"
read -p "Enter choice (1 or 2): " DATA_MODE

if [ "$DATA_MODE" == "2" ]; then
    # Update docker-compose.yml for real data
    echo "📡 Configuring real Solana data mode..."
    sed -i.bak 's/USE_REAL_DATA: "false"/USE_REAL_DATA: "true"/' docker-compose.yml
    rm -f docker-compose.yml.bak
    echo "✅ Real data mode enabled"
else
    echo "🎭 Using mock data mode (default)"
fi

echo ""
echo "🚀 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🗄️  Initializing database..."
docker-compose exec -T backend npm run init-db

echo ""
echo "📦 Generating initial data..."
docker-compose exec -T backend npm run generate-mock

echo ""
echo "============================================"
echo "   ✅ Setup Complete!"
echo "============================================"
echo ""
echo "🌐 Access the dashboard:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:4000"
echo "   Health Check: http://localhost:4000/health"
echo ""
echo "📝 Useful commands:"
echo "   View logs:          docker-compose logs -f"
echo "   Stop services:      docker-compose down"
echo "   Restart services:   docker-compose restart"
echo "   Regenerate data:    docker-compose exec backend npm run generate-mock"
echo ""
if [ "$DATA_MODE" == "2" ]; then
    echo "💡 Note: You're using real Solana data. Check DATA_SOURCE_GUIDE.md"
    echo "   for advanced configuration (Helius, Solscan Pro, etc.)"
fi
echo ""
echo "📖 Documentation:"
echo "   README.md - Getting started"
echo "   DATA_SOURCE_GUIDE.md - Configure data sources"
echo "   DEPLOYMENT_RENDER.md - Deploy to Render.com"
echo "   DEPLOYMENT_AWS.md - Deploy to AWS ECS"
echo ""
