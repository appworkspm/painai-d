

import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, Clock, Users, Settings, DollarSign, CheckCircle2, FileText, PieChart, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/projects', icon: Briefcase, label: 'Projects' },
  { to: '/timesheets', icon: Clock, label: 'Timesheets' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { user } = useAuth();
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary">Painai</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        {/* Reports Section */}
        <div className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reports</div>
          <NavLink
            to="/report"
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )
            }
          >
            <PieChart className="mr-3 h-5 w-5" />
            Workload Report
          </NavLink>
          <NavLink
            to="/project-report"
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )
            }
          >
            <FileText className="mr-3 h-5 w-5" />
            Project Report
          </NavLink>
          <NavLink
            to="/project-cost-report"
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )
            }
          >
            <DollarSign className="mr-3 h-5 w-5" />
            Project Cost Report
          </NavLink>
          <NavLink
            to="/my-cost"
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )
            }
          >
            <ListChecks className="mr-3 h-5 w-5" />
            My Cost Requests
          </NavLink>
          {user?.role === 'VP' && (
            <NavLink
              to="/cost-approval"
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              <CheckCircle2 className="mr-3 h-5 w-5" />
              Cost Approval
            </NavLink>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
