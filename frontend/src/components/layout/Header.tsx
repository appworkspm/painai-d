import { Bell, Sun, Moon, Menu, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return t('menu.dashboard');
    if (path.startsWith('/projects')) return t('menu.project_management');
    if (path.startsWith('/timesheets')) return t('menu.timesheet_management');
    if (path.startsWith('/reports')) return t('menu.reports');
    if (path.startsWith('/cost')) return t('menu.cost_management');
    if (path.startsWith('/admin')) return t('menu.administration');
    if (path === '/profile') return t('menu.profile');
    if (path === '/settings') return t('menu.settings');
    return 'Dashboard';
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-700">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="ml-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{getPageTitle()}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
            {user?.email || 'User'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
          title={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
          title={t('notifications.title')}
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-600">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex md:flex-col md:items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName || user?.email || 'User'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'User'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('profile.title')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{t('menu.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{t('menu.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('menu.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;