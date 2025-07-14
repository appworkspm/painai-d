import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // ใช้ email แทน username
      const res = await authAPI.login({ email: username, password });
      if (res.success && res.data?.token) {
        if (remember) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } else {
          sessionStorage.setItem('token', res.data.token);
          sessionStorage.setItem('user', JSON.stringify(res.data.user));
        }
        setUser(res.data.user); // อัปเดต AuthContext
        // redirect ตาม role (ตอนนี้ทุก role ไป /dashboard)
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-700 to-blue-400 relative">
        <div className="text-white text-2xl font-bold mb-2 tracking-widest drop-shadow">วันนี้ไปไหน?</div>
        <div className="text-white mb-2 font-semibold text-lg tracking-wide">Design by appworks</div>
        <div className="text-white text-xs opacity-80">version 1.0 Powered by Cursor AI</div>
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
                placeholder="Email"
                className="w-full outline-none bg-transparent"
                value={username}
                onChange={e => setUsername(e.target.value)}
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
                placeholder="Password"
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              Remember me
            </label>
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password
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
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
} 