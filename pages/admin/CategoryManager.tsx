import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { Category } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    setCategories(storageService.getCategories());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    const cat: Category = {
      id: Math.random().toString(36).substring(2, 9),
      name: newCat.trim(),
      description: newDesc.trim()
    };
    storageService.saveCategory(cat);
    setCategories(storageService.getCategories());
    setNewCat('');
    setNewDesc('');
  };

  const handleDelete = (id: string) => {
    storageService.deleteCategory(id);
    setCategories(storageService.getCategories());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">সংবাদ বিভাগ ব্যবস্থাপনা</h1>
        <p className="text-xs text-slate-500 mt-0.5">পোর্টালের বিভাগসমূহ সংযোজন ও বিয়োজন করুন</p>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white p-6 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
      >
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">বিভাগের নাম *</label>
          <input
            required
            type="text"
            placeholder="উদা: স্বাস্থ্য ও পরিবেশ"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
          />
        </div>
        <div className="sm:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">সংক্ষিপ্ত বিবরণ</label>
          <input
            type="text"
            placeholder="বিভাগের বিষয়বস্তু..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
        </div>
        <div className="sm:col-span-3">
          <button
            type="submit"
            className="w-full bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-sm hover:bg-red-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={15} /> যুক্ত করুন
          </button>
        </div>
      </form>

      <div className="bg-white overflow-hidden border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="px-6 py-3.5 font-semibold">বিভাগের নাম</th>
              <th className="px-6 py-3.5 font-semibold">বিবরণ</th>
              <th className="px-6 py-3.5 font-semibold text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4 font-semibold text-slate-900">{cat.name}</td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {cat.description || 'দরগাহপুর সংবাদের নিয়মিত বিভাগ'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    aria-label="মুছে ফেলুন"
                    className="p-1.5 text-red-700 hover:bg-red-50 rounded-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
