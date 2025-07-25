import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  X, 
  Home, 
  Clock, 
  FileText, 
  FolderOpen, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  User,
  ChevronDown
} from 'lucide-react';
import { NotificationCenter } from '../ui/NotificationCenter';
import { EnhancedAIAssistant } from '../ui/EnhancedAIAssistant';

const MobileLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
  ];

  const adminNavigation = [
    {
      name: t('menu.admin_panel', 'จัดการระบบ'),
      icon: Users,
      href: '/admin',
    },
  ];

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setActiveDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Painai</h1>
              <p className="text-xs text-gray-500">Timesheet Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationCenter
              notifications={[]}
              onMarkAsRead={() => {}}
              onMarkAllAsRead={() => {}}
              onDelete={() => {}}
              onClearAll={() => {}}
            />
            <Link
              to="/profile"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <User className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Painai</h2>
                <p className="text-sm text-gray-500">Timesheet Management</p>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {/* Home */}
                <Link
                  to="/dashboard"
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>หน้าแรก</span>
                </Link>

                {/* Navigation Items */}
                {navigation.map((item) => {
                  const isActive = item.children.some((c) => location.pathname === c.href);
                  const isDropdownOpen = activeDropdown === item.name;

                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      {isDropdownOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = location.pathname === child.href;
                            return (
                              <Link
                                key={child.name}
                                to={child.href}
                                onClick={closeSidebar}
                                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                  isChildActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
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
                })}

                {/* Admin Navigation */}
                {user?.role === 'ADMIN' && (
                  <>
                    <div className="pt-4 border-t">
                      <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        การจัดการ
                      </h3>
                    </div>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          location.pathname === item.href
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </>
                )}

                {/* Logout */}
                <div className="pt-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('menu.logout')}</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              location.pathname === '/dashboard'
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">หน้าแรก</span>
          </Link>
          
          <Link
            to="/timesheets"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              location.pathname.startsWith('/timesheets')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-xs mt-1">ไทม์ชีท</span>
          </Link>
          
          <Link
            to="/projects"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              location.pathname.startsWith('/projects')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-xs mt-1">โครงการ</span>
          </Link>
          
          <Link
            to="/report"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              location.pathname.startsWith('/report')
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs mt-1">รายงาน</span>
          </Link>
        </div>
      </nav>

      {/* AI Assistant */}
      <EnhancedAIAssistant />
    </div>
  );
};

export default MobileLayout; 