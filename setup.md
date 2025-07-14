# 🚀 การติดตั้งและรันโปรเจค ไปไหน (Painai)

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

## 🛠 การติดตั้ง

### 1. Clone และติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies ทั้งหมด
npm run install:all
```

### 2. Setup Environment Variables

#### Backend (.env)
สร้างไฟล์ `backend/.env` จาก `backend/env.example`:

```bash
cp backend/env.example backend/.env
```

แก้ไข `backend/.env`:
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://painai_user:painai_password@localhost:5432/painai_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### Frontend (.env)
สร้างไฟล์ `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. รันด้วย Docker (แนะนำ)

```bash
# Start all services
npm run docker:up

# หรือใช้ docker-compose โดยตรง
docker-compose up -d
```

### 4. รันแบบ Manual

#### Database Setup
```bash
# Start PostgreSQL (ถ้าใช้ Docker)
docker run -d \
  --name painai-postgres \
  -e POSTGRES_DB=painai_db \
  -e POSTGRES_USER=painai_user \
  -e POSTGRES_PASSWORD=painai_password \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🌐 เข้าถึงแอปพลิเคชัน

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api

## 👥 ข้อมูลสำหรับทดสอบ

### Users
- **Admin**: admin@painai.com / admin123
- **Manager**: manager@painai.com / manager123  
- **User**: user@painai.com / user123

## 📊 Features ที่พร้อมใช้งาน

### ✅ Backend API
- [x] Authentication (JWT)
- [x] User Management
- [x] Timesheet CRUD
- [x] Project Management (placeholder)
- [x] Role-based Access Control
- [x] Database Schema (PostgreSQL + Prisma)
- [x] API Documentation

### ✅ Frontend
- [x] Modern UI with Tailwind CSS
- [x] Authentication & Protected Routes
- [x] Dashboard with Statistics
- [x] Timesheet Management
- [x] Real-time Data Updates
- [x] Responsive Design

### ✅ DevOps
- [x] Docker Configuration
- [x] Environment Management
- [x] Development Setup
- [x] Database Seeding

## 🔧 Development Commands

```bash
# Root level
npm run dev                    # Start both frontend and backend
npm run build                  # Build both frontend and backend
npm run docker:up             # Start all services with Docker
npm run docker:down           # Stop all services

# Backend only
cd backend
npm run dev                   # Start development server
npm run build                 # Build for production
npm run db:generate          # Generate Prisma client
npm run db:push              # Push schema to database
npm run db:seed              # Seed database with sample data
npm run db:studio            # Open Prisma Studio

# Frontend only
cd frontend
npm run dev                   # Start development server
npm run build                 # Build for production
npm run preview               # Preview production build
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker restart painai-postgres

# Check database connection
cd backend
npm run db:push
```

### Port Conflicts
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Kill processes if needed
taskkill /PID <PID> /F
```

### Node Modules Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Next Steps

### Planned Features
- [ ] Project Management UI
- [ ] User Management UI
- [ ] Advanced Reporting
- [ ] Email Notifications
- [ ] File Uploads
- [ ] Mobile App
- [ ] Real-time Notifications
- [ ] Advanced Analytics

### Production Deployment
- [ ] Environment Configuration
- [ ] SSL/TLS Setup
- [ ] Database Backup
- [ ] Monitoring & Logging
- [ ] CI/CD Pipeline

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. 