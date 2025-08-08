# 🚀 PAI-NAI Quick Deployment Guide

## 📋 Overview
PAI-NAI = ไปไหน? - Timesheet Management System
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL

## 🌐 Free Cloud Hosting Setup

### Option 1: Vercel (Frontend) + Railway (Backend + Database) - แนะนำ

#### Step 1: Deploy Backend to Railway
1. **ไปที่ [railway.app](https://railway.app)**
2. **Sign up/Login ด้วย GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **เลือก repository: `painai`**
5. **เลือก folder: `backend`**
6. **เพิ่ม PostgreSQL Database:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway จะสร้าง DATABASE_URL ให้อัตโนมัติ

7. **ตั้ง Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=e11e22e07ba643828fedd2dd96c3f2a9ea04a63274cade16adfe84d693f298f185597b3d03ec5b50a003c337977dec563407a6da50b7133b1422c30e1e995eaf
   CORS_ORIGIN=https://painai-frontend.vercel.app
   ```

8. **Railway จะ auto-deploy ทุกครั้งที่ push ไป main branch**

#### Step 2: Deploy Frontend to Vercel
1. **ไปที่ [vercel.com](https://vercel.com)**
2. **Sign up/Login ด้วย GitHub**
3. **Click "New Project"**
4. **Import Git Repository: `painai`**
5. **เลือก folder: `frontend`**
6. **ตั้ง Environment Variable:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
7. **Click "Deploy"**

#### Step 3: Update CORS Origin
1. **กลับไปที่ Railway Backend**
2. **Update CORS_ORIGIN เป็น frontend URL จริง**
3. **Redeploy backend**

#### Step 4: Database Migration
1. **ใน Railway Backend, ไปที่ "Variables" tab**
2. **Copy DATABASE_URL**
3. **ไปที่ "Deployments" tab**
4. **Click "Deploy" เพื่อ run migration**

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment (Netlify)
1. **ไปที่ [netlify.com](https://netlify.com)**
2. **Connect GitHub repository**
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Environment variable:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

#### Backend Deployment (Render)
1. **ไปที่ [render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. **Add PostgreSQL Database service**
6. **Environment variables:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=e11e22e07ba643828fedd2dd96c3f2a9ea04a63274cade16adfe84d693f298f185597b3d03ec5b50a003c337977dec563407a6da50b7133b1422c30e1e995eaf
   CORS_ORIGIN=https://your-frontend-url.netlify.app
   NODE_ENV=production
   ```

## 🔧 Local Testing

### Test Backend
```bash
cd backend
cp env.production .env
npm install
npm run build
npm run db:generate
npm run db:push
npm start
```

### Test Frontend
```bash
cd frontend
npm install
# Edit .env with your API URL
npm run dev
```

## ✅ Verification Checklist

### Backend Health Check
- URL: `https://your-backend-url/health`
- Expected: `{"status":"OK","timestamp":"...","environment":"production"}`

### Frontend Test
- [ ] Login page loads
- [ ] Can register new user
- [ ] Can login with existing user
- [ ] Dashboard displays correctly
- [ ] Timesheet creation works
- [ ] API calls succeed

### Database Test
- [ ] Tables created successfully
- [ ] Can create/read/update/delete records
- [ ] Relationships work correctly

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGIN in backend
2. **Database Connection**: Verify DATABASE_URL
3. **Build Failures**: Check Node.js version (18+)
4. **Environment Variables**: Ensure all required vars are set

### Railway Issues
- Check deployment logs
- Verify environment variables
- Test database connection

### Vercel Issues
- Check build logs
- Verify environment variables
- Test API endpoints

## 🎉 Success!
Your PAI-NAI application is now live and ready for production use!

### URLs
- **Frontend**: `https://painai-frontend.vercel.app`
- **Backend**: `https://painai-backend.railway.app`
- **Health Check**: `https://painai-backend.railway.app/health`

### Next Steps
1. Test all features thoroughly
2. Set up monitoring (optional)
3. Configure custom domain (optional)
4. Set up backups (recommended) 