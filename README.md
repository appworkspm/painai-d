# ไปไหน (Painai) - Timesheet Management System

ระบบจัดการ timesheet สำหรับผู้บริหารติดตามการทำงานของ Project Manager

## 🚀 Features

- **บันทึก Timesheet**: บันทึกเวลาทำงานแบบ real-time
- **ประเภทงาน**: แยกงานโครงการ และงานไม่เกี่ยวกับโครงการ
- **รายงาน**: แสดงรายงานสำหรับผู้บริหาร
- **User Management**: จัดการผู้ใช้และสิทธิ์
- **Dashboard**: แสดงข้อมูลสรุปแบบ real-time

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Query
- React Router
- React Hook Form

### Backend
- Node.js + Express + TypeScript
- SQLite (for development)
- Prisma ORM
- JWT Authentication
- bcrypt

### DevOps
- Docker & Docker Compose
- Environment Configuration

## 📁 Project Structure

```
├── frontend/          # React application
├── backend/           # Node.js API server
├── docs/              # Documentation
└── docker-compose.yml # Docker configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd painai
npm run install:all
```

2. **Setup environment**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

3. **Setup database**
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📚 API Documentation

API documentation is available at `/docs/api` when the backend server is running.

## 🐳 Docker Deployment

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down
```

## 📝 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
