

import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
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
  FileText as FileTextIcon
} from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  
  // State for collapsible menu sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
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
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" exact />

        {/* Projects Section */}
        <Section title="Projects" icon={Briefcase} sectionKey="projects">
          <NavItem to="/projects" icon={ClipboardList} label="All Projects" />
          <NavItem to="/projects/new" icon={FileCheck} label="New Project" />
          <NavItem to="/projects/active" icon={Activity} label="Active Projects" />
          <NavItem to="/projects/completed" icon={CheckCircle2} label="Completed" />
        </Section>

        {/* Timesheets Section */}
        <Section title="Timesheets" icon={Clock} sectionKey="timesheets">
          <NavItem to="/timesheets" icon={FileText} label="My Timesheets" />
          <NavItem to="/timesheets/create" icon={FileText} label="New Timesheet" />
          <NavItem to="/timesheets/approval" icon={UserCheck} label="Approval Queue" />
          <NavItem to="/timesheets/history" icon={ClipboardCheck} label="History" />
        </Section>

        {/* Reports Section */}
        <Section title="Reports" icon={BarChart2} sectionKey="reports">
          <NavItem to="/reports/workload" icon={Activity} label="Workload Report" />
          <NavItem to="/reports/project" icon={FileBarChart2} label="Project Report" />
          <NavItem to="/reports/project-cost" icon={DollarSignIcon} label="Project Cost" />
          <NavItem to="/reports/user-activity" icon={UserIcon} label="User Activity" />
        </Section>

        {/* Cost Management Section */}
        <Section title="Cost Management" icon={DollarSign} sectionKey="costManagement">
          <NavItem to="/cost/my-requests" icon={ListChecks} label="My Requests" />
          <NavItem to="/cost/entry" icon={FileText} label="Cost Request" />
          <NavItem to="/cost/approval" icon={CheckCircle2} label="Approve Costs" />
          <NavItem to="/cost/reports" icon={BarChart3} label="Cost Reports" />
        </Section>

        {/* Admin Section */}
        {isAdmin && (
          <Section title="Administration" icon={ShieldCheck} sectionKey="admin">
            <NavItem to="/admin" icon={LayoutDashboard} label="Admin Dashboard" />
            <NavItem to="/users" icon={UsersIcon} label="User Management" />
            <NavItem to="/user-roles" icon={UserCog} label="User Roles" />
            <NavItem to="/holidays" icon={CalendarIcon} label="Holiday Calendar" />
            <NavItem to="/user-activity" icon={Activity} label="User Activity" />
            <NavItem to="/system-logs" icon={FileTextIcon} label="System Logs" />
          </Section>
        )}

        {/* User Section */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <NavItem to="/profile" icon={UserIcon} label="My Profile" />
          <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
        </div>
      </nav>
    </aside>
  );
};


export default Sidebar;
