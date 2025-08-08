# 🗄️ Database Migration: Render PostgreSQL → Neon

## 📋 Migration Summary
- **From:** Render PostgreSQL (expiring)
- **To:** Neon PostgreSQL (new)
- **Connection String:** `postgresql://neondb_owner:npg_yTtac2Hm5WRu@ep-billowing-thunder-a1viq4pt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

## 🔧 Updated Files
1. ✅ `render.env` - Updated DATABASE_URL
2. ✅ `render.yaml` - Added DATABASE_URL environment variable
3. ✅ `RENDER_DEPLOYMENT.md` - Updated connection string
4. ✅ Created `DATABASE_MIGRATION.md` - This file

## 🚀 Deployment Steps

### 1. Update Render Environment Variables
ใน Render dashboard:
1. ไปที่ Environment Variables
2. อัปเดต `DATABASE_URL` เป็น connection string ใหม่
3. หรือใช้ `render.yaml` ที่อัปเดตแล้ว

### 2. Deploy with New Database
```bash
git add .
git commit -m "Migrate to Neon database (v3.3.9)"
git push
```

### 3. Verify Migration
1. **Health Check:** `https://painai.onrender.com/health`
2. **Database Connection:** ตรวจสอบ logs ใน Render
3. **Application Test:** ทดสอบ login และใช้งานระบบ

## 🔍 Neon Database Features
- **Serverless:** Pay per use
- **Auto-scaling:** Automatically scales with usage
- **Branching:** Create database branches for development
- **Connection Pooling:** Built-in connection pooling
- **SSL Required:** Secure by default

## 🚨 Important Notes
- **SSL Mode:** `sslmode=require` (required for Neon)
- **Channel Binding:** `channel_binding=require` (security feature)
- **Pooler:** Using connection pooler for better performance
- **Region:** ap-southeast-1 (Asia Pacific - Singapore)

## ✅ Migration Complete
หลังจาก deploy เสร็จ ระบบจะใช้ Neon database แทน Render PostgreSQL 