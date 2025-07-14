# 📚 Painai API Documentation

## 🔗 Base URL
```
http://localhost:8000/api
```

## 🔐 Authentication

API ใช้ JWT (JSON Web Token) สำหรับ authentication

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## 📋 Endpoints

### Authentication

#### POST /auth/login
เข้าสู่ระบบ

**Request Body:**
```json
{
  "email": "admin@painai.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "admin@painai.com",
      "name": "Admin User",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/register
สมัครสมาชิกใหม่

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "USER"
}
```

#### GET /auth/profile
ดูข้อมูลผู้ใช้ปัจจุบัน

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_id",
    "email": "admin@painai.com",
    "name": "Admin User",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Timesheets

#### GET /timesheets
ดึงรายการ timesheets

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): หน้า (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 10)
- `search` (optional): ค้นหาจาก description
- `startDate` (optional): วันที่เริ่มต้น (YYYY-MM-DD)
- `endDate` (optional): วันที่สิ้นสุด (YYYY-MM-DD)
- `userId` (optional): ID ของผู้ใช้ (Admin only)
- `projectId` (optional): ID ของโครงการ
- `activityType` (optional): ประเภทกิจกรรม

**Response:**
```json
{
  "success": true,
  "message": "Timesheets retrieved successfully",
  "data": [
    {
      "id": "timesheet_id",
      "userId": "user_id",
      "projectId": "project_id",
      "activityType": "PROJECT_WORK",
      "description": "Frontend development",
      "startTime": "2024-01-01T09:00:00.000Z",
      "endTime": "2024-01-01T12:00:00.000Z",
      "duration": 180,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      },
      "project": {
        "id": "project_id",
        "name": "Project Name"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### POST /timesheets
สร้าง timesheet ใหม่

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "projectId": "project_id", // optional
  "activityType": "PROJECT_WORK",
  "description": "Working on frontend components",
  "startTime": "2024-01-01T09:00:00.000Z",
  "endTime": "2024-01-01T12:00:00.000Z", // optional
  "duration": 180 // optional, in minutes
}
```

**Activity Types:**
- `PROJECT_WORK`: งานโครงการ
- `NON_PROJECT_WORK`: งานไม่เกี่ยวกับโครงการ
- `MEETING`: การประชุม
- `BREAK`: พัก
- `OTHER`: อื่นๆ

#### GET /timesheets/:id
ดูข้อมูล timesheet เฉพาะ

**Headers:** `Authorization: Bearer <token>`

#### PUT /timesheets/:id
อัปเดต timesheet

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (same as POST, but all fields optional)

#### DELETE /timesheets/:id
ลบ timesheet (soft delete)

**Headers:** `Authorization: Bearer <token>`

### Users (Admin Only)

#### GET /users
ดึงรายการผู้ใช้ (Admin only)

**Headers:** `Authorization: Bearer <token>`

### Projects (Manager+ Only)

#### GET /projects
ดึงรายการโครงการ (Manager+ only)

**Headers:** `Authorization: Bearer <token>`

## 🔒 Role-based Access Control

### User Roles
- **ADMIN**: เข้าถึงทุกฟีเจอร์
- **MANAGER**: จัดการโครงการและดูรายงาน
- **USER**: บันทึก timesheet ของตัวเอง

### Permission Matrix

| Endpoint | ADMIN | MANAGER | USER |
|----------|-------|---------|------|
| /auth/* | ✅ | ✅ | ✅ |
| /timesheets (GET) | ✅ All | ✅ Own | ✅ Own |
| /timesheets (POST) | ✅ | ✅ | ✅ |
| /timesheets (PUT) | ✅ All | ✅ Own | ✅ Own |
| /timesheets (DELETE) | ✅ All | ✅ Own | ✅ Own |
| /users/* | ✅ | ❌ | ❌ |
| /projects/* | ✅ | ✅ | ❌ |

## 📊 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Timesheet not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 🚀 Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## 📝 Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Timesheet
```typescript
interface Timesheet {
  id: string;
  userId: string;
  projectId?: string;
  activityType: 'PROJECT_WORK' | 'NON_PROJECT_WORK' | 'MEETING' | 'BREAK' | 'OTHER';
  description: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  project?: Project;
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  managerId: string;
  createdAt: string;
  updatedAt: string;
  manager?: User;
}
```

## 🔧 Development

### Health Check
```
GET /health
```

### API Info
```
GET /api
```

### Database Status
```
GET /api/db/status
``` 