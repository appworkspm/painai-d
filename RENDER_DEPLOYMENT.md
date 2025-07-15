# 🚀 PAI-NAI Render Deployment Guide

## 📋 Current Issue
The application is failing to serve the frontend because the build files are not being created during deployment.

## 🔧 Solution

### Option 1: Use render.yaml (Recommended)

1. **The `render.yaml` file is already configured** in the root directory
2. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - The build process will:
     - Build the frontend
     - Copy frontend files to backend
     - Build the backend
     - Start the application

### Option 2: Manual Configuration

If you prefer manual configuration:

1. **Build Command:**
   ```bash
   cd frontend && npm install && npm run build && cd .. && mkdir -p backend/frontend && cp -r frontend/dist/* backend/frontend/ && cd backend && npm install && npx prisma generate && npm run build
   ```

2. **Start Command:**
   ```bash
   cd backend && npm start
   ```

3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=e11e22e07ba643828fedd2dd96c3f2a9ea04a63274cade16adfe84d693f298f185597b3d03ec5b50a003c337977dec563407a6da50b7133b1422c30e1e995eaf
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://painai.onrender.com
   DATABASE_URL=postgresql://painai_user:MDu9QWUcIezihmxKH58cX2BXEoTc8NvQ@dpg-d1q90bk9c44c739b8obg-a.oregon-postgres.render.com/painai
   ```

## 🔍 What Was Fixed

1. **Build Process:** The build now properly creates frontend build files and copies them to the backend
2. **File Paths:** Updated the backend to look for frontend files in the correct location
3. **Error Handling:** Added better error messages when frontend files are missing
4. **Deployment Configuration:** Created `render.yaml` for automated deployment

## 🧪 Testing

### Local Testing
```bash
# Test the build process locally
./build.sh

# Start the backend
cd backend && npm start
```

### Verify Deployment
1. **Health Check:** `https://painai.onrender.com/health`
2. **Frontend:** `https://painai.onrender.com/`
3. **API:** `https://painai.onrender.com/api`

## 🚨 Troubleshooting

### If you still see the "no such file or directory" error:

1. **Check Build Logs:** Look at the Render deployment logs to see if the frontend build succeeded
2. **Verify File Structure:** The backend should have a `frontend/` directory with `index.html`
3. **Manual Build:** Try running the build script locally to test

### Common Issues:
- **Node.js Version:** Ensure Render is using Node.js 18+
- **Memory Limits:** Free tier has memory limits, consider upgrading if builds fail
- **Build Timeout:** Free tier has 15-minute build timeout

## 🎉 Success!
After deployment, your application should serve both the API and frontend from the same URL: `https://painai.onrender.com` 