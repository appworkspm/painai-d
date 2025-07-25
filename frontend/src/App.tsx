import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './theme/ThemeProvider';
import AppLayout from './components/layout/AppLayout';
import SimpleLayout from './components/layout/SimpleLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ProjectProgress from './pages/ProjectProgress';
import ProjectDashboard from './pages/ProjectDashboard';
import EditProject from './pages/EditProject';
import ProjectProgressList from './pages/ProjectProgressList';
import ProjectProgressDashboard from './pages/ProjectProgressDashboard';
import Timesheets from './pages/Timesheets';
import CreateTimesheet from './pages/CreateTimesheet';
import CreateProject from './pages/CreateProject';
import ActiveProjects from './pages/ActiveProjects';
import CompletedProjects from './pages/CompletedProjects';
import TimesheetHistory from './pages/TimesheetHistory';
import TimesheetApproval from './pages/TimesheetApproval';
import TimesheetReport from './pages/TimesheetReport';
import WorkloadReport from './pages/WorkloadReport';
import ProjectReport from './pages/ProjectReport';
import ProjectCostReport from './pages/ProjectCostReport';
import MyCostRequests from './pages/MyCostRequests';
import ProjectCostEntry from './pages/ProjectCostEntry';
import CostApproval from './pages/CostApproval';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';

// Admin route wrapper
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  console.log('AdminRoute - User role:', user?.role);
  return user?.role === 'ADMIN' ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <GlobalErrorHandler>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
            <NotificationProvider>
              <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route 
                path="/timesheets/create" 
                element={
                  <SimpleLayout>
                    <CreateTimesheet />
                  </SimpleLayout>
                } 
              />
              
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
                <Route path="projects/create" element={<CreateProject />} />
                <Route path="projects/active" element={<ActiveProjects />} />
                <Route path="projects/completed" element={<CompletedProjects />} />
                <Route path="projects/dashboard" element={<ProjectDashboard />} />
                <Route 
                  path="projects/:id" 
                  element={
                    <ProjectDetails />
                  } 
                />
                <Route 
                  path="projects/:id/edit" 
                  element={
                    <EditProject />
                  } 
                />
                <Route 
                  path="projects/:id/progress" 
                  element={
                    <ProjectProgress />
                  } 
                />
                
                {/* Project Progress Routes */}
                <Route path="/project-progress" element={<ProjectProgressList />} />
                <Route path="/project-progress/:projectId" element={<ProjectProgressDashboard />} />
                
                {/* Timesheets */}
                <Route path="timesheets" element={<Timesheets />} />
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
                <Route path="reports/timesheet" element={<TimesheetReport />} />
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
        </GlobalErrorHandler>
    </ErrorBoundary>
  );
};

export default App;