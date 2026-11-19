import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('rifaz');
  const [password, setPassword] = useState('rifaz');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = storageService.getUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

    if (user && user.status === 'Blocked') {
      setError('এই অ্যাকাউন্টটি বর্তমানে স্থগিত রয়েছে।');
      return;
    }

    if (user && password === 'rifaz') {
      storageService.setSession(user);
      navigate('/admin');
    } else {
      setError('ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full border border-slate-200 p-8 sm:p-10">
        <div className="text-center mb-8 pb-5 border-b border-slate-200">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
            বার্তা কক্ষ লগইন
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-950">দরগাহপুর সংবাদ</h1>
          <p className="text-xs text-slate-500 mt-1">সম্পাদকীয় ও অ্যাডমিন প্যানেলে প্রবেশ করুন</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 p-3.5 text-red-800 flex items-center gap-2 text-xs font-medium">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">ইউজারনেম</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400">
                <UserIcon size={16} />
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                placeholder="ইউজারনেম"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">পাসওয়ার্ড</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                placeholder="পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mt-1.5 text-xs text-slate-500 font-mono text-right">
              ডেমো: rifaz / rifaz
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-red-800 transition-colors"
          >
            লগইন করুন
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors"
          >
            ← মূল ওয়েবসাইটে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
};
