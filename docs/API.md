# Painai API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Routes Overview

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| GET | `/auth/profile` | Get user profile | Yes |
| PATCH | `/auth/profile` | Update user profile | Yes |

### 👥 Users (`/api/users`)
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/users` | Get all users | Yes | Admin |
| GET | `/users/:id` | Get user by ID | Yes | Admin |
| POST | `/users` | Create new user | Yes | Admin |
| PUT | `/users/:id` | Update user | Yes | Admin |
| DELETE | `/users/:id` | Delete user | Yes | Admin |

### 📋 Projects (`/api/projects`)
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/projects` | Get all projects | Yes | Any |
| GET | `/projects/:id` | Get project by ID | Yes | Any |
| POST | `/projects` | Create new project | Yes | Manager/Admin |
| PUT | `/projects/:id` | Update project | Yes | Manager/Admin |
| DELETE | `/projects/:id` | Delete project | Yes | Manager/Admin |

### ⏰ Timesheets (`/api/timesheets`)
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/timesheets/my` | Get user's own timesheets | Yes | Any |
| GET | `/timesheets/history` | Get user's timesheet history | Yes | Any |
| GET | `/timesheets/pending` | Get pending timesheets | Yes | Any |
| GET | `/timesheets` | Get all timesheets | Yes | Manager/Admin |
| POST | `/timesheets` | Create timesheet | Yes | Any |
| PUT | `/timesheets/:id` | Update timesheet | Yes | Any |
| DELETE | `/timesheets/:id` | Delete timesheet | Yes | Any |
| GET | `/timesheets/:id/history` | Get timesheet history | Yes | Any |
| PATCH | `/timesheets/:id/submit` | Submit timesheet | Yes | Any |
| PATCH | `/timesheets/:id/approve` | Approve timesheet | Yes | Manager/Admin |

### 📊 Reports (`/api/reports`)

#### Data Reports
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/reports/workload` | Get workload report | Yes | Any |
| GET | `/reports/timesheet` | Get timesheet report | Yes | Any |
| GET | `/reports/project` | Get project report | Yes | Any |
| GET | `/reports/user-activity` | Get user activity report | Yes | Any |

#### CSV Export
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/reports/export/workload/csv` | Export workload data as CSV | Yes | Any |
| GET | `/reports/export/timesheet/csv` | Export timesheet data as CSV | Yes | Any |
| GET | `/reports/export/project/csv` | Export project data as CSV | Yes | Any |
| GET | `/reports/export/user-activity/csv` | Export user activity data as CSV | Yes | Any |

## Query Parameters

### Reports Filters
All report endpoints support the following query parameters:

#### Common Filters
- `start`: Start date (YYYY-MM-DD)
- `end`: End date (YYYY-MM-DD)
- `workType`: Work type filter (PROJECT, NON_PROJECT)
- `subWorkType`: Sub work type filter
- `activity`: Activity filter

#### Specific Filters
- **Timesheet Report**: `status`, `project`
- **User Activity Report**: `user`
- **Workload Report**: `department`

#### Examples
```
GET /api/reports/workload?start=2024-01-01&end=2024-01-31&workType=PROJECT
GET /api/reports/timesheet?status=approved&project=123
GET /api/reports/user-activity?user=456&start=2024-01-01
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Health Check
```
GET /health
```

Returns server status and environment information.

## Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

## Rate Limiting
- 1000 requests per 15 minutes per IP address
- Exceeded limit returns 429 status code 