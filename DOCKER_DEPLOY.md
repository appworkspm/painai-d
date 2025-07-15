# 🐳 PAI-NAI Docker Deployment Guide

## 📋 Overview
PAI-NAI = ไปไหน? - Timesheet Management System
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Reverse Proxy**: Nginx

## 🚀 Free Cloud Hosting with Docker

### Option 1: Railway (แนะนำ - ง่ายที่สุด)

#### Step 1: Deploy to Railway
1. **ไปที่ [railway.app](https://railway.app)**
2. **Sign up/Login ด้วย GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **เลือก repository: `painai`**
5. **Railway จะ detect Dockerfile อัตโนมัติ**
6. **เพิ่ม PostgreSQL Database:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway จะสร้าง DATABASE_URL ให้อัตโนมัติ

7. **ตั้ง Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=e11e22e07ba643828fedd2dd96c3f2a9ea04a63274cade16adfe84d693f298f185597b3d03ec5b50a003c337977dec563407a6da50b7133b1422c30e1e995eaf
   CORS_ORIGIN=https://your-app-url.railway.app
   ```

8. **Railway จะ auto-deploy ทุกครั้งที่ push ไป main branch**

### Option 2: Render

#### Step 1: Deploy to Render
1. **ไปที่ [render.com](https://render.com)**
2. **Sign up/Login ด้วย GitHub**
3. **Click "New +" → "Web Service"**
4. **Connect GitHub repository: `painai`**
5. **ตั้งค่า:**
   - **Name**: `painai-app`
   - **Build Command**: `docker build -t painai .`
   - **Start Command**: `docker run -p 8000:8000 painai`
6. **เพิ่ม PostgreSQL Database service**
7. **ตั้ง Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=e11e22e07ba643828fedd2dd96c3f2a9ea04a63274cade16adfe84d693f298f185597b3d03ec5b50a003c337977dec563407a6da50b7133b1422c30e1e995eaf
   CORS_ORIGIN=https://your-app-url.onrender.com
   NODE_ENV=production
   ```

### Option 3: Fly.io

#### Step 1: Deploy to Fly.io
1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly:**
   ```bash
   fly auth login
   ```

3. **Deploy:**
   ```bash
   fly launch
   ```

4. **Add PostgreSQL:**
   ```bash
   fly postgres create
   fly postgres attach <database-name>
   ```

## 🔧 Local Development with Docker

### Quick Start
```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Individual Services
```bash
# Start only database
docker-compose up postgres -d

# Start only app
docker-compose up app -d

# Start with nginx
docker-compose up -d
```

### Database Operations
```bash
# Access database
docker-compose exec postgres psql -U painai_user -d painai

# Run migrations
docker-compose exec app npm run db:push

# Reset database
docker-compose down -v
docker-compose up postgres -d
```

## 📊 Monitoring

### Health Checks
- **App**: `http://localhost:8000/health`
- **Database**: `docker-compose exec postgres pg_isready -U painai_user -d painai`

### Logs
```bash
# App logs
docker-compose logs app

# Database logs
docker-compose logs postgres

# Nginx logs
docker-compose logs nginx

# All logs
docker-compose logs -f
```

## 🔒 Security

### Environment Variables
- **JWT_SECRET**: ใช้ secret ที่ปลอดภัย
- **DATABASE_URL**: ตั้งโดย cloud provider
- **CORS_ORIGIN**: ตั้งเป็น frontend URL

### Network Security
- Database ไม่ expose ไปภายนอก
- Nginx ทำ reverse proxy
- Rate limiting เปิดใช้งาน

## 🚨 Troubleshooting

### Common Issues
1. **Database Connection**: ตรวจสอบ DATABASE_URL
2. **Build Failures**: ตรวจสอบ Dockerfile
3. **Port Conflicts**: เปลี่ยน port ใน docker-compose.yml
4. **Memory Issues**: เพิ่ม memory limit

### Debug Commands
```bash
# Check container status
docker-compose ps

# Check container resources
docker stats

# Access container shell
docker-compose exec app sh

# View container details
docker inspect painai-app
```

## 🎉 Success!
Your PAI-NAI application is now running in Docker containers!

### URLs
- **Local**: `http://localhost`
- **Railway**: `https://your-app-url.railway.app`
- **Render**: `https://your-app-url.onrender.com`
- **Fly.io**: `https://your-app-url.fly.dev`

### Next Steps
1. Test all features
2. Set up monitoring
3. Configure custom domain
4. Set up backups 