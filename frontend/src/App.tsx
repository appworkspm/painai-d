import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Timesheets from './pages/Timesheets'
import ProtectedRoute from './components/ProtectedRoute'
import Report from './pages/Report';
import Profile from './pages/Profile';
import TimesheetReport from './pages/TimesheetReport';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="timesheets" element={<Timesheets />} />
          <Route path="report" element={<Report />} />
          <Route path="report/timesheet" element={<TimesheetReport />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App 