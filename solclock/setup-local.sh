#!/bin/bash

echo "==================================="
echo "SolClock Local Setup"
echo "==================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"

# Setup backend
echo ""
echo "Setting up backend..."
cd backend

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created backend/.env"
else
    echo "✓ backend/.env already exists"
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install --silent

echo "✓ Backend setup complete"

# Setup frontend
echo ""
echo "Setting up frontend..."
cd ../frontend

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✓ Created frontend/.env.local"
else
    echo "✓ frontend/.env.local already exists"
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install --silent

echo "✓ Frontend setup complete"

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL and Redis are running"
echo "2. Initialize database: cd backend && npm run init-db"
echo "3. Generate mock data: npm run generate-mock"
echo "4. Start backend: npm run dev (Terminal 1)"
echo "5. Start frontend: cd frontend && npm run dev (Terminal 2)"
echo "6. Open http://localhost:3000"
echo ""
