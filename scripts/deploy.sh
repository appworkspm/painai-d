#!/bin/bash

echo "🚀 Starting PAI-NAI Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Building Backend..."
cd backend

# Install dependencies
print_status "Installing backend dependencies..."
npm install

# Build TypeScript
print_status "Building TypeScript..."
npm run build

# Generate Prisma client
print_status "Generating Prisma client..."
npm run db:generate

cd ..

print_status "Building Frontend..."
cd frontend

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Build for production
print_status "Building for production..."
npm run build

cd ..

print_status "✅ Build completed successfully!"

echo ""
print_status "Next steps for deployment:"
echo ""
echo "1. 🚀 Deploy Backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repository"
echo "   - Select the 'backend' folder"
echo "   - Add PostgreSQL database service"
echo "   - Set environment variables:"
echo "     DATABASE_URL=postgresql://..."
echo "     JWT_SECRET=your-secure-secret"
echo "     CORS_ORIGIN=https://your-frontend-url.vercel.app"
echo "     NODE_ENV=production"
echo ""
echo "2. 🌐 Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Select the 'frontend' folder"
echo "   - Set environment variable:"
echo "     VITE_API_URL=https://your-backend-url.railway.app"
echo ""
echo "3. 🔗 Update CORS_ORIGIN in backend with your frontend URL"
echo ""
echo "4. 🗄️ Run database migration:"
echo "   cd backend"
echo "   npm run db:push"
echo ""
print_status "🎉 Your PAI-NAI app will be live and ready for production!" 