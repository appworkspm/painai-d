# 🚀 PAI-NAI Deployment Guide

## 📋 Overview
PAI-NAI = ไปไหน? - Timesheet Management System
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL

## 🌐 Free Cloud Hosting Setup

### Option 1: Vercel (Frontend) + Railway (Backend + Database)

#### Frontend Deployment (Vercel)
1. **Connect to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy frontend
   cd frontend
   vercel --prod
   ```

2. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

#### Backend Deployment (Railway)
1. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Select backend folder

2. **Add PostgreSQL Database:**
   - Add PostgreSQL service
   - Copy DATABASE_URL to environment variables

3. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secure-secret
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```

4. **Deploy:**
   - Railway will auto-deploy on push to main branch

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify)
1. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

#### Backend Deployment (Render)
1. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`

## 🔧 Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npm run db:generate
npm run db:push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## 📊 Database Migration

### Production Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to production database
npm run db:push

# Seed initial data (if needed)
npm run db:seed
```

## 🔒 Security Checklist

- [ ] Change default JWT secret
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Enable helmet security headers

## 📈 Monitoring

### Health Check Endpoints
- Backend: `GET /health`
- Frontend: Built-in Vite health check

### Logs
- Vercel: Built-in logging
- Railway: Built-in logging
- Render: Built-in logging

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGIN environment variable
2. **Database Connection**: Verify DATABASE_URL
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Ensure all required vars are set

### Support
- Check deployment logs in respective platforms
- Verify environment variables are correctly set
- Test API endpoints with Postman/curl

## 🎉 Success!
Your PAI-NAI application is now live and ready for production use! 