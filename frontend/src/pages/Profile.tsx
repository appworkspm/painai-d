import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { User as UserIcon, Save, Shield, Calendar, Mail, User, Eye, EyeOff } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords if changing password
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          showNotification({
            message: t('profile.error.current_password_required'),
            type: 'error'
          });
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          showNotification({
            message: t('profile.error.passwords_do_not_match'),
            type: 'error'
          });
          return;
        }
        if (formData.newPassword.length < 6) {
          showNotification({
            message: t('profile.error.password_min_length'),
            type: 'error'
          });
          return;
        }
      }

      const updateData: any = { name: formData.name };
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await usersAPI.updateProfile(updateData);
      if (response.data) {
        setUser(response.data);
        setIsEditing(false);
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        showNotification({
          message: t('profile.success.update'),
          type: 'success'
        });
      }
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || t('profile.error.update_failed'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center mb-8">
        <UserIcon className="h-10 w-10 text-blue-600 mr-4" />
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.name_label')}</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            disabled={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.email_label')}</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>
        {isEditing && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.current_password_label')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e => handleInputChange('currentPassword', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.new_password_label')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e => handleInputChange('newPassword', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.confirm_password_label')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                autoComplete="new-password"
              />
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={e => setShowPassword(e.target.checked)}
                id="showPassword"
                className="mr-2"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-600 cursor-pointer">{t('profile.show_password')}</label>
            </div>
          </>
        )}
        <div className="flex gap-4 mt-6">
          {isEditing ? (
            <>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
                disabled={loading}
              >
                <Save className="inline-block mr-2 h-5 w-5" />
                {t('profile.save_button')}
              </button>
              <button
                type="button"
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                {t('profile.cancel_button')}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
              onClick={() => setIsEditing(true)}
            >
              <UserIcon className="inline-block mr-2 h-5 w-5" />
              {t('profile.edit_button')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile; 