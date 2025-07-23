import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  BarChart3, 
  LogOut, 
  User, 
  Shield, 
  FileText, 
  FolderOpen,
  Home,
  Users,
  Activity
} from 'lucide-react';
import { useState } from 'react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: t('menu.my_timesheet'),
      icon: Clock,
      children: [
        { name: t('menu.my_timesheets'), href: '/timesheets' },
        { name: t('menu.create_timesheet'), href: '/timesheets/create' },
      ],
    },
    {
      name: t('menu.review_timesheet'),
      icon: FileText,
      children: [
        { name: t('menu.timesheet_dashboard'), href: '/timesheets/dashboard' },
        { name: t('menu.timesheet_approval'), href: '/timesheets/approval' },
      ],
    },
    {
      name: t('menu.project_management'),
      icon: FolderOpen,
      children: [
        { name: t('menu.all_projects'), href: '/projects' },
        { name: t('menu.project_details'), href: '/projects/details' },
      ],
    },
    {
      name: t('menu.reports'),
      icon: BarChart3,
      children: [
        { name: t('menu.workload_report'), href: '/report/workload' },
      ],
    },
    { name: t('menu.profile'), href: '/profile', icon: User },
  ];

  // Add Admin Panel menu item for admin users
  const adminNavigation = [
    { name: t('menu.admin_panel'), href: '/admin', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">ไปไหน (Painai)</h1>
          </div>

          {/* Language Switcher */}
          <div className="flex justify-center py-2 border-b border-gray-200 gap-2">
            <button onClick={() => i18n.changeLanguage('th')} className={i18n.language === 'th' ? 'font-bold underline' : ''}>ไทย</button>
            <button onClick={() => i18n.changeLanguage('en')} className={i18n.language === 'en' ? 'font-bold underline' : ''}>EN</button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
            {navigation.map((item) => {
              if (!item.children) {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              } else {
                // submenu
                const [open, setOpen] = useState(() => {
                  // Auto-expand if current path matches any child
                  return item.children.some((c) => location.pathname === c.href);
                });
                const isParentActive = item.children.some((c) => location.pathname === c.href);
                return (
                  <div key={item.name}>
                    <button
                      type="button"
                      onClick={() => setOpen((v) => !v)}
                      className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isParentActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                      <span className="ml-auto">{open ? '▾' : '▸'}</span>
                    </button>
                    {open && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                isActive
                                  ? 'bg-primary-50 text-primary-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            })}
            {/* Admin menu */}
            {user?.role === 'admin' && adminNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full mt-4"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t('menu.logout')}
            </button>
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className="ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout; 