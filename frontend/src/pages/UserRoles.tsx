import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Shield, Settings, User, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { adminAPI } from '../services/api';

const UserRoles: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRolesAndUsers();
  }, []);

  const loadRolesAndUsers = async () => {
    setLoading(true);
    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        adminAPI.getRoles(),
        adminAPI.getUsers()
      ]);

      if (rolesResponse.success && rolesResponse.data) {
        setRoles(rolesResponse.data);
      }

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (error) {
      showNotification({
        message: 'Failed to load roles and users',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setEditForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions || []
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: Implement actual role update logic
      showNotification({
        message: 'Role update functionality coming soon',
        type: 'info'
      });
      setShowEditModal(false);
      setSelectedRole(null);
    } catch (error: any) {
      showNotification({
        message: 'Failed to update role',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    setEditForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        setDeleting(roleId);
        const response = await adminAPI.deleteRole(roleId);
        if (response.success) {
          showNotification({
            message: 'Role deleted successfully',
            type: 'success'
          });
          loadRolesAndUsers();
        } else {
          showNotification({
            message: response.message || 'Failed to delete role',
            type: 'error'
          });
        }
      } catch (error: any) {
        showNotification({
          message: error.response?.data?.message || 'Failed to delete role',
          type: 'error'
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleCreateRole = () => {
    // Navigate to create role page or open modal
    showNotification({
      message: 'Create role functionality coming soon',
      type: 'info'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-yellow-100 text-yellow-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'MANAGER':
        return <Settings className="h-5 w-5 text-yellow-600" />;
      case 'USER':
        return <User className="h-5 w-5 text-blue-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const mockRoles = [
    {
      id: '1',
      name: 'ADMIN',
      description: 'Full system access and control',
      permissions: ['user_management', 'project_management', 'system_settings', 'reports'],
      userCount: 2
    },
    {
      id: '2',
      name: 'MANAGER',
      description: 'Project and team management',
      permissions: ['project_management', 'timesheet_approval', 'reports'],
      userCount: 5
    },
    {
      id: '3',
      name: 'USER',
      description: 'Basic user access',
      permissions: ['timesheet_management', 'profile_management'],
      userCount: 15
    }
  ];

  const mockUsers = users.length > 0 ? users : [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'ADMIN' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'MANAGER' },
    { id: '3', name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'USER' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">User Roles</h1>
        </div>
        <button
          onClick={handleCreateRole}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">System Roles</h2>
          </div>
          <div className="p-6 space-y-4">
            {mockRoles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRoleIcon(role.name)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{role.userCount} users</span>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {role.name !== 'ADMIN' && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Permissions
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission: string) => (
                      <span
                        key={permission}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Users by Role</h2>
          </div>
          <div className="p-6 space-y-6">
            {mockRoles.map((role) => (
              <div key={role.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(role.name)}
                    <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role.name)}`}>
                      {role.userCount} users
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {mockUsers
                    .filter((user) => user.role === role.name)
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button className="text-primary-600 hover:text-primary-900 text-sm">
                          Edit
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Role Permissions Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                'User Management',
                'Project Management',
                'Timesheet Management',
                'Timesheet Approval',
                'Reports Access',
                'System Settings'
              ].map((permission) => (
                <tr key={permission}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {permission}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ['Project Management', 'Timesheet Approval', 'Reports Access'].includes(permission)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {['Project Management', 'Timesheet Approval', 'Reports Access'].includes(permission) ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ['Timesheet Management'].includes(permission)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {['Timesheet Management'].includes(permission) ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Role</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {[
                      'user_management',
                      'project_management',
                      'timesheet_management',
                      'timesheet_approval',
                      'reports',
                      'system_settings'
                    ].map((permission) => (
                      <div key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={editForm.permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={permission} className="ml-2 block text-sm text-gray-900">
                          {permission.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Role
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRole(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles; 