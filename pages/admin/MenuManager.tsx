import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { MenuItem } from '../../types';
import { Plus, Trash2, Edit, Save } from 'lucide-react';

export const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({ label: '', url: '', order: 0 });

  useEffect(() => {
    setMenuItems(storageService.getMenuItems());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.label || !newItem.url) return;

    const item: MenuItem = {
      id: Math.random().toString(36).substring(2, 9),
      label: newItem.label.trim(),
      url: newItem.url.trim(),
      order: newItem.order || menuItems.length
    };

    storageService.saveMenuItem(item);
    setMenuItems(storageService.getMenuItems());
    setNewItem({ label: '', url: '', order: menuItems.length + 1 });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    storageService.saveMenuItem(editingItem);
    setMenuItems(storageService.getMenuItems());
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    storageService.deleteMenuItem(id);
    setMenuItems(storageService.getMenuItems());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">নেভিগেশন মেনু বিন্যাস</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          হেডার বারের প্রধান লিঙ্কসমূহ (সর্বোচ্চ ৫টি লিঙ্ক প্রদর্শিত হয়)
        </p>
      </div>

      <section className="bg-white p-6 border border-slate-200">
        <h2 className="font-serif text-base font-bold text-slate-900 mb-4">
          {editingItem ? 'মেনু আইটেম সম্পাদনা করুন' : 'নতুন মেনু লিঙ্ক যুক্ত করুন'}
        </h2>
        <form
          onSubmit={editingItem ? handleUpdate : handleAdd}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">মেনু নাম *</label>
            <input
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
              placeholder="উদা: সাহিত্য ও ব্লগ"
              value={editingItem ? editingItem.label : newItem.label}
              onChange={(e) =>
                editingItem
                  ? setEditingItem({ ...editingItem, label: e.target.value })
                  : setNewItem({ ...newItem, label: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">লিঙ্ক (URL) *</label>
            <input
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
              placeholder="উদা: /category/সাহিত্য ও ব্লগ"
              value={editingItem ? editingItem.url : newItem.url}
              onChange={(e) =>
                editingItem
                  ? setEditingItem({ ...editingItem, url: e.target.value })
                  : setNewItem({ ...newItem, url: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white text-xs font-semibold py-2.5 px-4 rounded-sm hover:bg-red-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              {editingItem ? (
                <>
                  <Save size={15} /> আপডেট করুন
                </>
              ) : (
                <>
                  <Plus size={15} /> যুক্ত করুন
                </>
              )}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-2 text-xs text-slate-600 font-semibold hover:text-slate-900"
              >
                বাতিল
              </button>
            )}
          </div>
        </form>
      </section>

      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="px-6 py-3.5 font-semibold">ক্রম</th>
              <th className="px-6 py-3.5 font-semibold">মেনু লেবেল</th>
              <th className="px-6 py-3.5 font-semibold">লিঙ্ক (URL)</th>
              <th className="px-6 py-3.5 font-semibold text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {menuItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4 font-mono text-xs text-slate-500 tabular-nums">
                  {(index + 1).toLocaleString('bn-BD')}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">{item.label}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.url}</td>
                <td className="px-6 py-4 text-right space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-sm"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-700 hover:bg-red-50 rounded-sm"
                  >
                    <Trash2 size={15} />
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
