import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider'; // Assuming you have a ThemeProvider

const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold ml-4">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        {/* User Profile Dropdown will go here */}
      </div>
    </header>
  );
};

export default Header;