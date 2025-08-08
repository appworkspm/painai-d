#!/bin/bash

# Build script for Painai deployment
echo "🚀 Starting Painai deployment build..."

# Exit on any error
set -e

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy frontend build to backend
echo "📋 Copying frontend build to backend..."
mkdir -p backend/frontend/dist
cp -r frontend/dist/* backend/frontend/dist/

# Build backend
echo "🔧 Building backend..."
cd backend
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
echo "📁 Frontend build copied to: backend/frontend/dist/"
echo "📁 Backend build located at: backend/dist/" 