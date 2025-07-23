import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart
} from 'lucide-react';

const DatabaseManagement: React.FC = () => {
  const { t } = useTranslation();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBackingUp(false);
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRestoring(false);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsOptimizing(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
        <p className="text-gray-600">Manage database operations, backups, and maintenance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup & Restore */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Backup & Restore</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-900">Last Backup</h3>
                <p className="text-sm text-blue-700">2024-01-15 14:30:00</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBackingUp ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
              </button>
              
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRestoring ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isRestoring ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </div>
        </div>

        {/* Database Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <BarChart className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">Database Statistics</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">156 MB</div>
                <div className="text-sm text-gray-600">Database Size</div>
              </div>
            </div>
            
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isOptimizing ? 'Optimizing...' : 'Optimize Database'}
            </button>
          </div>
        </div>

        {/* Maintenance Log */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold">Maintenance Log</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Database backup completed successfully</p>
                <p className="text-xs text-green-700">2024-01-15 14:30:00</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Database optimization completed</p>
                <p className="text-xs text-blue-700">2024-01-14 09:15:00</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Large query detected - optimization recommended</p>
                <p className="text-xs text-yellow-700">2024-01-13 16:45:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="h-5 w-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium">Refresh Cache</p>
                <p className="text-sm text-gray-600">Clear application cache</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Trash2 className="h-5 w-5 text-red-600 mr-3" />
              <div className="text-left">
                <p className="font-medium">Clean Logs</p>
                <p className="text-sm text-gray-600">Remove old log files</p>
              </div>
            </button>
            
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Database className="h-5 w-5 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium">Check Integrity</p>
                <p className="text-sm text-gray-600">Verify database integrity</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement; 