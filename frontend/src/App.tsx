import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './theme/ThemeProvider';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectProgress from './pages/ProjectProgress';
import ProjectDashboard from './pages/ProjectDashboard';
import Timesheets from './pages/Timesheets';
import CreateTimesheet from './pages/CreateTimesheet';
import TimesheetHistory from './pages/TimesheetHistory';
import TimesheetApproval from './pages/TimesheetApproval';
import WorkloadReport from './pages/WorkloadReport';
import ProjectReport from './pages/ProjectReport';
import ProjectCostReport from './pages/ProjectCostReport';
import MyCostRequests from './pages/MyCostRequests';
import ProjectCostEntry from './pages/ProjectCostEntry';
import CostApproval from './pages/CostApproval';
import Users from './pages/Users';
import UserRoles from './pages/UserRoles';
import HolidayManagement from './pages/HolidayManagement';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import UserActivity from './pages/UserActivity';
import UserActivityReport from './pages/UserActivityReport';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';

// Admin route wrapper
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Outlet />
                    </AppLayout>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Projects */}
                <Route path="projects" element={<Projects />} />
                <Route path="projects/dashboard" element={<ProjectDashboard />} />
                <Route 
                  path="projects/:id" 
                  element={
                    <ProjectDetails />
                  } 
                />
                <Route 
                  path="projects/:id/progress" 
                  element={
                    <ProjectProgress />
                  } 
                />
                
                {/* Timesheets */}
                <Route path="timesheets" element={<Timesheets />} />
                <Route path="timesheets/create" element={<CreateTimesheet />} />
                <Route path="timesheets/history" element={<TimesheetHistory />} />
                <Route path="timesheets/approval" element={<TimesheetApproval />} />
                
                {/* Reports */}
                <Route path="reports/workload" element={<WorkloadReport />} />
                <Route path="reports/project" element={<ProjectReport />} />
                <Route 
                  path="reports/project-cost" 
                  element={
                    <ProjectCostReport 
                      projectId={new URLSearchParams(location.search).get('projectId') || ''} 
                    />
                  } 
                />
                <Route path="reports/user-activity" element={<UserActivityReport />} />
                
                {/* Cost Management */}
                <Route path="cost/my-requests" element={<MyCostRequests />} />
                <Route 
                  path="cost/entry" 
                  element={
                    <ProjectCostEntry 
                      projectId={new URLSearchParams(location.search).get('projectId') || ''} 
                    />
                  } 
                />
                <Route path="cost/approval" element={<CostApproval />} />
                
                {/* Admin Routes */}
                <Route
                  path="admin"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <AdminRoute>
                      <Users />
                    </AdminRoute>
                  }
                />
                <Route
                  path="user-roles"
                  element={
                    <AdminRoute>
                      <UserRoles />
                    </AdminRoute>
                  }
                />
                <Route
                  path="holidays"
                  element={
                    <AdminRoute>
                      <HolidayManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="user-activity"
                  element={
                    <AdminRoute>
                      <UserActivity />
                    </AdminRoute>
                  }
                />
                
                {/* User Routes */}
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                
                {/* 404 - Keep this last */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;