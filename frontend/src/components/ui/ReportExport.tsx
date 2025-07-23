import React, { useState } from 'react';
import { Button } from './Button';
import { Download, FileText, FileSpreadsheet, Printer, Share2, Copy, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './dropdown-menu';
import { cn } from '../../lib/utils';

interface ReportExportProps {
  onExport: (format: 'csv' | 'excel' | 'pdf' | 'print' | 'share' | 'copy') => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showShare?: boolean;
  showCopy?: boolean;
  fileName?: string;
}

export const ReportExport: React.FC<ReportExportProps> = ({
  onExport,
  loading = false,
  disabled = false,
  className,
  variant = 'default',
  showShare = true,
  showCopy = true,
  fileName
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' | 'print' | 'share' | 'copy') => {
    setIsExporting(true);
    setExportingFormat(format);
    try {
      await onExport(format);
      
      // Show copied feedback
      if (format === 'copy') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setIsExporting(false);
      setExportingFormat('');
    }
  };

  const exportOptions = [
    {
      label: 'CSV',
      value: 'csv' as const,
      icon: FileSpreadsheet,
      description: 'ไฟล์ CSV สำหรับ Excel',
      color: 'text-green-600'
    },
    {
      label: 'Excel',
      value: 'excel' as const,
      icon: FileSpreadsheet,
      description: 'ไฟล์ Excel (.xlsx)',
      color: 'text-green-600'
    },
    {
      label: 'PDF',
      value: 'pdf' as const,
      icon: FileText, // Changed from FilePdf to FileText
      description: 'ไฟล์ PDF',
      color: 'text-red-600'
    },
    {
      label: 'พิมพ์',
      value: 'print' as const,
      icon: Printer,
      description: 'พิมพ์รายงาน',
      color: 'text-blue-600'
    }
  ];

  const additionalOptions = [
    ...(showShare ? [{
      label: 'แชร์',
      value: 'share' as const,
      icon: Share2,
      description: 'แชร์ลิงก์รายงาน',
      color: 'text-purple-600'
    }] : []),
    ...(showCopy ? [{
      label: copied ? 'คัดลอกแล้ว' : 'คัดลอก',
      value: 'copy' as const,
      icon: copied ? Check : Copy,
      description: 'คัดลอกข้อมูล',
      color: copied ? 'text-green-600' : 'text-gray-600'
    }] : [])
  ];

  const getButtonContent = () => {
    if (variant === 'icon-only') {
      return <Download className="h-4 w-4" />;
    }
    
    if (variant === 'compact') {
      return (
        <>
          <Download className="h-4 w-4" />
          {loading || isExporting ? 'กำลัง Export...' : 'Export'}
        </>
      );
    }
    
    return (
      <>
        <Download className="h-4 w-4" />
        {loading || isExporting ? 'กำลัง Export...' : 'Export รายงาน'}
      </>
    );
  };

  const getButtonSize = () => {
    switch (variant) {
      case 'compact': return 'sm';
      case 'icon-only': return 'sm';
      default: return 'default';
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={getButtonSize()}
            disabled={disabled || loading || isExporting}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              variant === 'icon-only' && "p-2",
              (loading || isExporting) && "animate-pulse"
            )}
          >
            {getButtonContent()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
            Export รายงาน
          </div>
          
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isExportingThis = exportingFormat === option.value;
            
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleExport(option.value)}
                disabled={isExporting}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                  isExportingThis && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                <Icon className={cn("h-4 w-4", option.color)} />
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </span>
                </div>
                {isExportingThis && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                )}
              </DropdownMenuItem>
            );
          })}
          
          {additionalOptions.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {additionalOptions.map((option) => {
                const Icon = option.icon;
                const isExportingThis = exportingFormat === option.value;
                
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleExport(option.value)}
                    disabled={isExporting}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                      isExportingThis && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", option.color)} />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                    </div>
                    {isExportingThis && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
          
          {fileName && (
            <>
              <DropdownMenuSeparator />
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                ไฟล์: {fileName}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 