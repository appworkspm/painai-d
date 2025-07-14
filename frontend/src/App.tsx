import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Timesheets from './pages/Timesheets'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Report from './pages/Report';
import Profile from './pages/Profile';
import TimesheetReport from './pages/TimesheetReport';
import AdminPanel from './pages/AdminPanel';

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
            <Route path="timesheets" element={<Timesheets />} />
            <Route path="report" element={<Report />} />
            <Route path="report/timesheet" element={<TimesheetReport />} />
            <Route path="profile" element={<Profile />} />
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