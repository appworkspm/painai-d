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
  Activity,
  Settings,
  Calendar,
  DollarSign,
  Database,
  BarChart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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

  // Comprehensive Admin Panel menu items
  const adminNavigation = [
    {
      name: t('menu.admin_panel'),
      icon: Shield,
      children: [
        { name: t('menu.dashboard'), href: '/admin', icon: Home },
        { name: t('menu.user_management'), href: '/admin/users', icon: Users },
        { name: t('menu.user_roles'), href: '/admin/user-roles', icon: Shield },
        { name: t('menu.holiday_management'), href: '/admin/holidays', icon: Calendar },
        { name: t('menu.cost_approval'), href: '/admin/cost-approval', icon: DollarSign },
        { name: t('menu.user_activity'), href: '/admin/user-activity', icon: Activity },
        { name: t('menu.user_activity_report'), href: '/admin/user-activity-report', icon: BarChart },
        { name: t('menu.database_management'), href: '/admin/database', icon: Database },
        { name: t('menu.system_settings'), href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const renderMenuItem = (item: any, isAdmin = false) => {
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
          title={sidebarCollapsed ? item.name : undefined}
        >
          <item.icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!sidebarCollapsed && item.name}
        </Link>
      );
    } else {
      const [open, setOpen] = useState(() => {
        return item.children.some((c: any) => location.pathname === c.href);
      });
      const isParentActive = item.children.some((c: any) => location.pathname === c.href);
      
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
            title={sidebarCollapsed ? item.name : undefined}
          >
            <item.icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!sidebarCollapsed && (
              <>
                {item.name}
                <span className="ml-auto">{open ? '▾' : '▸'}</span>
              </>
            )}
          </button>
          {open && !sidebarCollapsed && (
            <div className="ml-8 mt-1 space-y-1">
              {item.children.map((child: any) => {
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white shadow-lg"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            {sidebarCollapsed ? (
              <h1 className="text-xl font-bold text-primary-600">P</h1>
            ) : (
              <h1 className="text-xl font-bold text-primary-600">ไปไหน (Painai)</h1>
            )}
          </div>

          {/* Language Switcher */}
          {!sidebarCollapsed && (
            <div className="flex justify-center py-2 border-b border-gray-200 gap-2">
              <button 
                onClick={() => i18n.changeLanguage('th')} 
                className={i18n.language === 'th' ? 'font-bold underline' : ''}
              >
                ไทย
              </button>
              <button 
                onClick={() => i18n.changeLanguage('en')} 
                className={i18n.language === 'en' ? 'font-bold underline' : ''}
              >
                EN
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
            {navigation.map((item) => renderMenuItem(item))}
            
            {/* Admin menu */}
            {user?.role === 'admin' && adminNavigation.map((item) => renderMenuItem(item, true))}
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full mt-4 ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? t('menu.logout') : undefined}
            >
              <LogOut className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && t('menu.logout')}
            </button>
          </nav>

          {/* Sidebar toggle button */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title={sidebarCollapsed ? t('menu.expand_sidebar') : t('menu.collapse_sidebar')}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout; 