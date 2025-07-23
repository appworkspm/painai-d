import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './badge';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  variant?: 'default' | 'outlined' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  showTrend?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  status = 'neutral',
  variant = 'default',
  size = 'md',
  className,
  onClick,
  loading = false,
  showTrend = true
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      case 'error': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
      default: return 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined': return 'bg-transparent border-2';
      case 'gradient': return 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800';
      default: return '';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return 'p-4';
      case 'lg': return 'p-6';
      default: return 'p-5';
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    return trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-3 w-3" />;
    return trend.isPositive ? 
      <TrendingUp className="h-3 w-3" /> : 
      <TrendingDown className="h-3 w-3" />;
  };

  const getValueSize = () => {
    switch (size) {
      case 'sm': return 'text-xl';
      case 'lg': return 'text-3xl';
      default: return 'text-2xl';
    }
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group',
        'border-2 hover:border-blue-300 dark:hover:border-blue-600',
        getStatusColor(),
        getVariantStyle(),
        getSizeStyle(),
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn('pb-2', size === 'sm' ? 'pb-1' : size === 'lg' ? 'pb-3' : 'pb-2')}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            'font-medium text-gray-600 dark:text-gray-300 transition-colors group-hover:text-gray-800 dark:group-hover:text-gray-100',
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
          )}>
            {title}
          </CardTitle>
          {icon && (
            <div className={cn(
              'text-gray-400 dark:text-gray-500 transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300',
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            {loading ? (
              <div className={cn(
                'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
                size === 'sm' ? 'h-6 w-16' : size === 'lg' ? 'h-10 w-24' : 'h-8 w-20'
              )} />
            ) : (
              <div className={cn(
                'font-bold text-gray-900 dark:text-gray-100',
                getValueSize()
              )}>
                {value}
              </div>
            )}
            {subtitle && (
              <div className={cn(
                'text-gray-500 dark:text-gray-400 mt-1 transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300',
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-sm'
              )}>
                {subtitle}
              </div>
            )}
          </div>
          {showTrend && trend && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium ml-4',
              getTrendColor()
            )}>
              {getTrendIcon()}
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              {trend.period && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  {trend.period}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 