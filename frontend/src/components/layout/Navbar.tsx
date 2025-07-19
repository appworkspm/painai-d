import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  Menu,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type NavbarProps = {
  onMenuClick: () => void;
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, text: 'New timesheet submitted', read: false },
    { id: 2, text: 'Timesheet approved', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu button and breadcrumb */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Painai Timesheet
          </h1>
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`${!notification.read ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <Bell className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {notification.text}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No new notifications
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white">
                    {user?.name
                      ?.split(' ')
                      .map(n => n[0])
                      .join('') || 
                      user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.name}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {user?.role}
                  </span>
                </span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
