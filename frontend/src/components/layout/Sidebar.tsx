

import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  FileText, 
  ListChecks, 
  BarChart2,
  Activity,
  LayoutDashboard,
  FileCheck,
  ClipboardList,
  UserCheck,
  ShieldCheck,
  BarChart3,
  FileBarChart2,
  DollarSign as DollarSignIcon,
  User as UserIcon,
  ClipboardCheck,
  Users as UsersIcon,
  CheckCircle2,
  Settings as SettingsIcon,
  UserCog,
  Calendar as CalendarIcon,
  FileText as FileTextIcon,
  FolderOpen,
  Plus,
  History,
  TrendingUp,
  PieChart,
  Building2,
  Shield,
  Cog,
  LogOut
} from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isVP = user?.role === 'vp';
  
  // State for collapsible menu sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dashboard: true,
    projects: true,
    timesheets: true,
    reports: true,
    costManagement: true,
    admin: isAdmin,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const NavItem = ({ to, icon: Icon, label, badge, exact = false }: {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge?: string | number;
    exact?: boolean;
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-primary/10 text-primary dark:bg-primary/20'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
          'group'
        )
      }
      end={exact}
    >
      <div className="flex items-center">
        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium rounded-full bg-primary/10 text-primary">
          {badge}
        </span>
      )}
    </NavLink>
  );

  const Section = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    children,
    defaultOpen = true
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    sectionKey: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const isOpen = openSections[sectionKey] ?? defaultOpen;
    const hasActiveChild = React.Children.toArray(children).some(child => 
      React.isValidElement(child) && 
      location.pathname === child.props.to
    );

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            hasActiveChild
              ? 'text-primary bg-primary/5 dark:bg-primary/10'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
            'group'
          )}
        >
          <div className="flex items-center">
            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span>{title}</span>
          </div>
          <svg
            className={cn(
              'h-5 w-5 transform transition-transform',
              isOpen ? 'rotate-0' : '-rotate-90'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && <div className="ml-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
          {children}
        </div>}
      </div>
    );
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary">Painai</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <Section title={t('menu.dashboard')} icon={LayoutDashboard} sectionKey="dashboard">
          <NavItem to="/" icon={TrendingUp} label={t('menu.overview')} exact />
          <NavItem to="/dashboard" icon={PieChart} label={t('menu.analytics')} />
        </Section>

        {/* Projects Section */}
        <Section title={t('menu.project_management')} icon={FolderOpen} sectionKey="projects">
          <NavItem to="/projects" icon={ClipboardList} label={t('menu.all_projects')} />
          <NavItem to="/projects/create" icon={Plus} label={t('menu.create_project')} />
          <NavItem to="/projects/active" icon={Activity} label={t('menu.active_projects')} />
          <NavItem to="/projects/completed" icon={CheckCircle2} label={t('menu.completed_projects')} />
        </Section>

        {/* Timesheets Section */}
        <Section title={t('menu.timesheet_management')} icon={Clock} sectionKey="timesheets">
          <NavItem to="/timesheets" icon={FileText} label={t('menu.my_timesheets')} />
          <NavItem to="/timesheets/create" icon={Plus} label={t('menu.create_timesheet')} />
          <NavItem to="/timesheets/history" icon={History} label={t('menu.timesheet_history')} />
          {(isAdmin || isManager || isVP) && (
            <NavItem to="/timesheets/approval" icon={UserCheck} label={t('menu.timesheet_approval')} />
          )}
        </Section>

        {/* Reports Section */}
        <Section title={t('menu.reports')} icon={BarChart2} sectionKey="reports">
          <NavItem to="/reports/workload" icon={Activity} label={t('menu.workload_report')} />
          <NavItem to="/reports/project" icon={FileBarChart2} label={t('menu.project_report')} />
          <NavItem to="/reports/project-cost" icon={DollarSignIcon} label={t('menu.project_cost_report')} />
          <NavItem to="/reports/timesheet" icon={FileText} label={t('menu.timesheet_report')} />
          {(isAdmin || isVP) && (
            <NavItem to="/reports/user-activity" icon={UserIcon} label={t('menu.user_activity_report')} />
          )}
        </Section>

        {/* Cost Management Section */}
        <Section title={t('menu.cost_management')} icon={DollarSign} sectionKey="costManagement">
          <NavItem to="/cost/my-requests" icon={ListChecks} label={t('menu.my_cost_requests')} />
          <NavItem to="/cost/entry" icon={Plus} label={t('menu.cost_entry')} />
          {(isAdmin || isManager || isVP) && (
            <NavItem to="/cost/approval" icon={CheckCircle2} label={t('menu.cost_approval')} />
          )}
        </Section>

        {/* Admin Section */}
        {(isAdmin || isVP) && (
          <Section title={t('menu.administration')} icon={Shield} sectionKey="admin">
            {isAdmin && (
              <NavItem to="/admin" icon={LayoutDashboard} label={t('menu.admin_panel')} />
            )}
            <NavItem to="/users" icon={UsersIcon} label={t('menu.user_management')} />
            {isAdmin && (
              <NavItem to="/user-roles" icon={UserCog} label={t('menu.user_roles')} />
            )}
            <NavItem to="/holidays" icon={CalendarIcon} label={t('menu.holiday_management')} />
            <NavItem to="/user-activity" icon={Activity} label={t('menu.user_activity')} />
            {isAdmin && (
              <NavItem to="/system-logs" icon={FileTextIcon} label={t('menu.system_logs')} />
            )}
          </Section>
        )}

        {/* User Section */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <NavItem to="/profile" icon={UserIcon} label={t('menu.profile')} />
          <NavItem to="/settings" icon={Cog} label={t('menu.settings')} />
          <button
            onClick={logout}
            className={cn(
              'w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              'group'
            )}
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            <span>{t('menu.logout')}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};


export default Sidebar;
