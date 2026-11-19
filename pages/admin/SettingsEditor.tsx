import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { SiteSettings } from '../../types';
import { Save, Check } from 'lucide-react';

export const SettingsEditor: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(storageService.getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">পোর্টাল সেটিংস ও মাস্টহেড তথ্য</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          পত্রিকার নাম, সম্পাদকীয় পরিচিতি, শিরোনাম বার এবং ফুটার তথ্য হালনাগাদ করুন
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
          <Check size={15} /> পোর্টাল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white p-6 sm:p-8 border border-slate-200 space-y-5">
          <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            সাধারণ ও সম্পাদকীয় তথ্য
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                পত্রিকা / পোর্টালের নাম
              </label>
              <input
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                প্রধান সম্পাদকের নাম
              </label>
              <input
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
                value={settings.editorName || ''}
                onChange={(e) => setSettings({ ...settings, editorName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              পোর্টাল স্লোগান / ট্যাগলাইন
            </label>
            <input
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              কপিরাইট ও ফুটার টেক্সট
            </label>
            <input
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
              value={settings.footerText}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="breakingNews"
              className="w-4 h-4 rounded-sm text-primary focus:ring-primary"
              checked={settings.breakingNewsEnabled}
              onChange={(e) => setSettings({ ...settings, breakingNewsEnabled: e.target.checked })}
            />
            <label htmlFor="breakingNews" className="text-xs font-semibold text-slate-800 cursor-pointer">
              প্রথম পাতায় ‘সদ্যপ্রাপ্ত শিরোনাম’ বার চালু রাখুন
            </label>
          </div>
        </section>

        <section className="bg-white p-6 sm:p-8 border border-slate-200 space-y-5">
          <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            সামাজিক যোগাযোগ লিঙ্ক
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">ফেসবুক পেজ</label>
              <input
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
                value={settings.socialLinks.facebook}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">ইউটিউব চ্যানেল</label>
              <input
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400"
                value={settings.socialLinks.youtube}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                  })
                }
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white text-xs font-semibold py-2.5 px-6 rounded-sm hover:bg-red-800 flex items-center gap-2 transition-colors"
          >
            <Save size={15} /> সেটিংস সংরক্ষণ করুন
          </button>
        </div>
      </form>
    </div>
  );
};
