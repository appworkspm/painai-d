import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Timesheets from './pages/Timesheets'
import CreateTimesheet from './pages/CreateTimesheet'
import TimesheetApproval from './pages/TimesheetApproval'
import TimesheetHistory from './pages/TimesheetHistory'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import Users from './pages/Users'
import UserRoles from './pages/UserRoles'
import UserActivity from './pages/UserActivity'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Report from './pages/Report'
import Profile from './pages/Profile'
import TimesheetReport from './pages/TimesheetReport'
import WorkloadReport from './pages/WorkloadReport'
import ProjectReport from './pages/ProjectReport'
import UserActivityReport from './pages/UserActivityReport'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Timesheet Systems */}
            <Route path="timesheets" element={<Timesheets />} />
            <Route path="timesheets/create" element={<CreateTimesheet />} />
            <Route path="timesheets/approval" element={<TimesheetApproval />} />
            <Route path="timesheets/history" element={<TimesheetHistory />} />
            
            {/* Project Management */}
            <Route path="projects" element={<Projects />} />
            <Route path="projects/details" element={<ProjectDetails />} />
            
            {/* Reports */}
            <Route path="report" element={<Report />} />
            <Route path="report/timesheet" element={<TimesheetReport />} />
            <Route path="report/workload" element={<WorkloadReport />} />
            <Route path="report/project" element={<ProjectReport />} />
            <Route path="report/activity" element={<UserActivityReport />} />
            
            {/* User Management (Admin Only) */}
            <Route path="users" element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
            <Route path="users/roles" element={
              <AdminRoute>
                <UserRoles />
              </AdminRoute>
            } />
            <Route path="users/activity" element={
              <AdminRoute>
                <UserActivity />
              </AdminRoute>
            } />
            
            {/* Profile */}
            <Route path="profile" element={<Profile />} />
            
            {/* Admin Panel */}
            <Route path="admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
          </Route>
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App 