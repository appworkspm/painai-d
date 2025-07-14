import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from 'react-query';
import { User as UserIcon, Save } from 'lucide-react';
import { usersAPI } from '../services/api';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateMutation = useMutation(usersAPI.updateProfile, {
    onSuccess: (data) => {
      setUser(data.data);
      setSuccess('Profile updated successfully!');
      setError('');
    },
    onError: (err: any) => {
      setError(err.message || 'Update failed');
      setSuccess('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    updateMutation.mutate({ name, password: password || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserIcon className="h-8 w-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>
      <div className="card max-w-lg mx-auto">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="input" value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
            </div>
            {success && <div className="text-green-600 text-sm">{success}</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="btn btn-primary flex items-center" disabled={updateMutation.isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isLoading ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 