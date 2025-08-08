#!/bin/bash

# Render Build Script for Painai
echo "🚀 Starting Painai Render deployment build..."

# Exit on any error
set -e

# Install dependencies for frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build
cd ..

# Create frontend directory in backend and copy build files
echo "📋 Copying frontend build to backend..."
mkdir -p backend/frontend
cp -r frontend/dist/* backend/frontend/

# Install dependencies for backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build backend
echo "🔨 Building backend..."
npm run build

cd ..

echo "✅ Render build completed successfully!"
echo "📁 Frontend build copied to: backend/frontend/"
echo "📁 Backend build located at: backend/dist/" 