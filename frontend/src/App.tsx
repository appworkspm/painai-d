import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './theme/ThemeProvider';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Timesheets from './pages/Timesheets';
import Reports from './pages/Report';
import Users from './pages/Users';
import Settings from './pages/Settings'; // Assuming a settings page will be created
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
              <Route path="projects" element={<Projects />} />
              <Route path="timesheets" element={<Timesheets />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;