#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting PainAI deployment on VMware..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "ℹ️  Please edit the .env file with your configuration and run this script again."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ./data/postgres

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R 1000:1000 ./data

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

# Create admin user (uncomment and modify as needed)
# echo "👤 Creating admin user..."
# docker-compose exec backend node dist/scripts/create-admin.js

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3000"
echo "📊 Database: postgresql://${DB_USER:-postgres}:*****@localhost:5432/${DB_NAME:-painai}"
