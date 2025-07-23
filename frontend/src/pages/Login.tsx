import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const getRedirectPath = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin'; // Admin panel
      case UserRole.MANAGER:
        return '/timesheets/approval'; // Manager sees approval page first
      case UserRole.USER:
      default:
        return '/timesheets'; // Regular users see timesheets first
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, remember);
      const currentUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
      const redirectPath = getRedirectPath(currentUser.role);
      navigate(redirectPath);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || t('login.error.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-700 to-blue-400 relative">
        <div className="text-white text-2xl font-bold mb-2 tracking-widest drop-shadow">{t('login.slogan')}</div>
        <div className="text-white mb-2 font-semibold text-lg tracking-wide">{t('login.design_by')}</div>
        <div className="text-white text-xs opacity-80">{t('login.version')}</div>
      </div>
      {/* Right Side */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg"
        >
          <div className="flex justify-center mb-6">
            {/* User Icon */}
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" fill="#1976d2" />
              <path d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" fill="#1976d2" />
            </svg>
          </div>
          <div className="mb-4">
            <div className="flex items-center border rounded px-3 py-2">
              <span className="mr-2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <input
                type="text"
                placeholder={t('login.email')}
                className="w-full outline-none bg-transparent"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center border rounded px-3 py-2">
              <span className="mr-2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#888" strokeWidth="2"/><path d="M7 11V7a5 5 0 1110 0v4" stroke="#888" strokeWidth="2"/></svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.password')}
                className="w-full outline-none bg-transparent"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="ml-2 focus:outline-none"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? t('login.hide_password') : t('login.show_password')}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#888" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="#888" strokeWidth="2"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a21.77 21.77 0 014.22-5.94M9.53 9.53A3.5 3.5 0 0114.47 14.47M1 1l22 22" stroke="#888" strokeWidth="2"/></svg>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4 text-xs">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="mr-1"
              />
              {t('login.remember_me')}
            </label>
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              {t('login.forgot_password')}
            </a>
          </div>
          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-center mb-2 animate-shake border border-red-300">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded font-bold text-lg hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-60"
            disabled={loading}
          >
            {t('login.login_button')}
          </button>
        </form>
      </div>
    </div>
  );
} 