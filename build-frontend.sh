#!/bin/bash

echo "🚀 Building frontend for Render deployment..."

# Exit on any error
set -e

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Go back to root
cd ..

# Create backend/frontend directory
echo "📋 Creating backend/frontend directory..."
mkdir -p backend/frontend

# Copy frontend build to backend
echo "📋 Copying frontend build to backend..."
cp -r frontend/dist/* backend/frontend/

echo "✅ Frontend build completed and copied to backend/frontend/"
ls -la backend/frontend/ 