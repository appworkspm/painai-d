import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword({ email });
      if (res.success) {
        setIsSuccess(true);
        setMessage(t('forgot.success'));
      } else {
        setError(res.message || t('forgot.error.send'));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || t('forgot.error.network'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
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
        <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-lg">
          <div className="flex justify-center mb-6">
            {/* Lock Icon */}
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" fill="#1976d2"/>
              <path d="M7 11V7a5 5 0 1110 0v4" stroke="#1976d2" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">{t('forgot.title')}</h2>
          <p className="text-gray-600 text-center mb-6">{t('forgot.desc')}</p>
          {!isSuccess ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="flex items-center border rounded px-3 py-2">
                  <span className="mr-2 text-gray-400">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#888" strokeWidth="2"/>
                      <polyline points="22,6 12,13 2,6" stroke="#888" strokeWidth="2"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder={t('forgot.email')}
                    className="w-full outline-none bg-transparent"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-center mb-4 animate-shake border border-red-300">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded font-bold text-lg hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-60 mb-4"
                disabled={loading}
              >
                {loading ? t('forgot.sending') : t('forgot.send_button')}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4 border border-green-300">
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                {message}
              </div>
              <button
                onClick={handleBackToLogin}
                className="w-full bg-gray-600 text-white py-2 rounded font-bold text-lg hover:bg-gray-700 transition"
              >
                {t('forgot.back_to_login')}
              </button>
            </div>
          )}
          <div className="text-center mt-4">
            <button
              onClick={handleBackToLogin}
              className="text-blue-600 hover:underline text-sm"
            >
              ← {t('forgot.back_to_login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 