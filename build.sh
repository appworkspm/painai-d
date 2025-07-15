#!/bin/bash

# Simple build script for Painai
echo "🚀 Building Painai application..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy frontend build to backend
echo "📋 Copying frontend build to backend..."
mkdir -p backend/frontend
cp -r frontend/dist/* backend/frontend/

# Build backend
echo "🔧 Building backend..."
cd backend
npm install
npx prisma generate
npm run build
cd ..

echo "✅ Build completed!" 