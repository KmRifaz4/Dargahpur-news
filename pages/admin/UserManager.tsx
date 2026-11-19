import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { User } from '../../types';
import { Plus, Trash2, ShieldCheck, Ban } from 'lucide-react';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Editor'>('Editor');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setUsers(storageService.getUsers());
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const user: User = {
      id: Math.random().toString(36).substring(2, 9),
      username: newUsername.trim().toLowerCase(),
      fullName: newFullName.trim() || newUsername.trim(),
      role: newRole,
      status: 'Active'
    };

    storageService.saveUser(user);
    setUsers(storageService.getUsers());
    setNewUsername('');
    setNewFullName('');
    setFeedback('নতুন সদস্য সফলভাবে যুক্ত করা হয়েছে।');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleStatus = (user: User) => {
    const updated: User = {
      ...user,
      status: user.status === 'Active' ? 'Blocked' : 'Active'
    };
    storageService.saveUser(updated);
    setUsers(storageService.getUsers());
  };

  const handleDelete = (id: string) => {
    if (users.length <= 1) return;
    storageService.deleteUser(id);
    setUsers(storageService.getUsers());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">সম্পাদনা পর্ষদ ও ইউজার ম্যানেজমেন্ট</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          পোর্টালের অ্যাডমিন ও প্রতিবেদকদের অ্যাকাউন্ট নিয়ন্ত্রণ করুন
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
          {feedback}
        </div>
      )}

      <form
        onSubmit={handleAddUser}
        className="bg-white p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">ইউজারনেম *</label>
          <input
            required
            type="text"
            placeholder="উদা: kamrul"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">পূর্ণ নাম ও পদবী</label>
          <input
            type="text"
            placeholder="উদা: কামরুল হাসান (প্রতিবেদক)"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">ভূমিকা</label>
          <select
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Editor')}
          >
            <option value="Editor">Editor (সম্পাদক/প্রতিবেদক)</option>
            <option value="Admin">Admin (প্রধান নিয়ন্ত্রক)</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800 transition-colors flex items-center justify-center gap-1.5 h-[38px]"
        >
          <Plus size={15} /> সদস্য যুক্ত করুন
        </button>
      </form>

      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="px-6 py-3.5 font-semibold">নাম ও ইউজারনেম</th>
              <th className="px-6 py-3.5 font-semibold">ভূমিকা</th>
              <th className="px-6 py-3.5 font-semibold">অবস্থা</th>
              <th className="px-6 py-3.5 font-semibold text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{u.fullName || u.username}</div>
                  <div className="text-xs font-mono text-slate-500">@{u.username}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-700 font-medium">{u.role}</td>
                <td className="px-6 py-4 text-xs">
                  <span className={u.status === 'Active' ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                    {u.status === 'Active' ? 'সক্রিয়' : 'স্থগিত'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u)}
                    className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-sm hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1"
                  >
                    {u.status === 'Active' ? <Ban size={13} /> : <ShieldCheck size={13} />}
                    <span>{u.status === 'Active' ? 'স্থগিত করুন' : 'সক্রিয় করুন'}</span>
                  </button>
                  {users.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
                      aria-label="মুছে ফেলুন"
                      className="p-1.5 text-red-700 hover:bg-red-50 rounded-sm"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
