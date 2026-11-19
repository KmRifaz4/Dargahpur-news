import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { CATEGORY_FALLBACK_IMAGES, DEFAULT_NEWS_IMAGE } from '../constants';
import { Post } from '../types';
import { Check, Send } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="bg-slate-50 border border-slate-200 p-8 sm:p-10 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          আমাদের পরিচিতি
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 leading-tight">
          দরগাহপুর ও উপকূলীয় জনপদের মানুষের কথা ও খবরের বিশ্বস্ত মাধ্যম
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          সাতক্ষীরা জেলার আশাশুনি উপজেলার দরগাহপুর ইউনিয়ন ও পার্শ্ববর্তী জনপদের শিক্ষা, কৃষি, সংস্কৃতি ও উন্নয়নের প্রামাণ্য দলিল হিসেবে ‘দরগাহপুর সংবাদ’ নিয়মিত প্রকাশিত হচ্ছে।
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 bg-white border border-slate-200 p-6 sm:p-8 space-y-5 text-slate-800 leading-relaxed text-sm sm:text-base">
          <h2 className="font-serif text-2xl font-bold text-slate-900">সম্পাদকীয় নীতিমালা</h2>
          <p>
            গ্রামীণ জনপদের অনেক গুরুত্বপূর্ণ সংবাদ, কৃষকের সাফল্য কিংবা শিক্ষাপ্রতিষ্ঠানের অর্জন জাতীয় গণমাধ্যমে প্রায়শই উপেক্ষিত থাকে। সেই শূন্যতা পূরণের লক্ষ্যেই স্থানীয় সাংবাদিক, শিক্ষক ও সুধীজনদের সমন্বয়ে দরগাহপুর সংবাদ পোর্টালের যাত্রা শুরু।
          </p>
          <p>
            প্রতিটি প্রতিবেদন প্রকাশের আগে স্থানীয় সূত্র থেকে তথ্য যাচাই করা হয়। গুজব বা অতিরঞ্জিত তথ্য পরিহার করে কেবল সত্য ও জনস্বার্থ সংশ্লিষ্ট সংবাদই পাঠকের সামনে তুলে ধরা আমাদের মূল লক্ষ্য।
          </p>
        </div>

        <aside className="md:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-6 space-y-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 pb-2.5 border-b border-slate-200">
              সম্পাদনা পর্ষদ
            </h3>
            <dl className="divide-y divide-slate-200 text-xs">
              <div className="py-2.5">
                <dt className="text-slate-500">প্রধান সম্পাদক</dt>
                <dd className="font-semibold text-slate-900 text-sm mt-0.5">রিফাজ উদ্দিন</dd>
              </div>
              <div className="py-2.5">
                <dt className="text-slate-500">বার্তা সম্পাদক</dt>
                <dd className="font-semibold text-slate-900 text-sm mt-0.5">শরিফুল ইসলাম</dd>
              </div>
              <div className="py-2.5">
                <dt className="text-slate-500">কৃষি ও অর্থনীতি ডেস্ক</dt>
                <dd className="font-semibold text-slate-900 text-sm mt-0.5">আব্দুর রহমান</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const categories = storageService.getCategories();
  const [mode, setMode] = useState<'report' | 'contact'>('report');
  const [submitted, setSubmitted] = useState(false);

  const [reportForm, setReportForm] = useState({
    title: '',
    category: categories[0]?.name || 'গ্রামের খবর',
    author: '',
    location: 'দরগাহপুর',
    content: ''
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.title.trim() || !reportForm.content.trim()) return;

    const newPost: Post = {
      id: Math.random().toString(36).substring(2, 9),
      title: reportForm.title.trim(),
      excerpt: reportForm.content.trim().substring(0, 140) + '...',
      content: reportForm.content.trim(),
      category: reportForm.category,
      author: reportForm.author.trim() || 'নাগরিক প্রতিবেদক',
      authorRole: 'স্থানীয় সংবাদদাতা',
      location: reportForm.location.trim(),
      readTime: '৩ মিনিট পাঠ',
      publishDate: new Date().toISOString(),
      imageUrl: CATEGORY_FALLBACK_IMAGES[reportForm.category] || DEFAULT_NEWS_IMAGE,
      featured: false,
      views: 1,
      tags: [reportForm.category, 'দরগাহপুর']
    };

    storageService.savePost(newPost);
    setSubmitted(true);
    setReportForm({
      title: '',
      category: categories[0]?.name || 'গ্রামের খবর',
      author: '',
      location: 'দরগাহপুর',
      content: ''
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="bg-slate-50 border border-slate-200 p-8 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          বার্তা কক্ষ ও যোগাযোগ
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950">
          সংবাদ পাঠান অথবা যোগাযোগ করুন
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          আপনার এলাকার যেকোনো জনগুরুত্বপূর্ণ সংবাদ, উন্নয়ন সমস্যা বা মতামত সরাসরি পোর্টালে প্রকাশের জন্য পাঠাতে পারেন।
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 w-fit">
            <button
              type="button"
              onClick={() => {
                setMode('report');
                setSubmitted(false);
              }}
              className={`px-4 py-1.5 rounded-xs text-xs font-semibold transition-colors ${
                mode === 'report' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              সংবাদ প্রেরণ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('contact');
                setSubmitted(false);
              }}
              className={`px-4 py-1.5 rounded-xs text-xs font-semibold transition-colors ${
                mode === 'contact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              সাধারণ যোগাযোগ
            </button>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Check size={15} className="text-emerald-700 shrink-0" />
                <span>
                  {mode === 'report'
                    ? 'আপনার সংবাদটি সফলভাবে প্রকাশিত হয়েছে!'
                    : 'আপনার বার্তাটি বার্তা কক্ষে পৌঁছেছে।'}
                </span>
              </div>
              {mode === 'report' && (
                <Link to="/" className="font-semibold underline whitespace-nowrap">
                  প্রচ্ছদ দেখুন
                </Link>
              )}
            </div>
          )}

          {mode === 'report' ? (
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  সংবাদের শিরোনাম *
                </label>
                <input
                  required
                  type="text"
                  placeholder="স্পষ্ট ও সংক্ষিপ্ত শিরোনাম"
                  className="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">বিভাগ *</label>
                  <select
                    className="w-full px-3 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                    value={reportForm.category}
                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    প্রতিবেদকের নাম *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="আপনার নাম"
                    className="w-full px-3 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                    value={reportForm.author}
                    onChange={(e) => setReportForm({ ...reportForm, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">স্থান</label>
                  <input
                    type="text"
                    placeholder="উদা: দরগাহপুর"
                    className="w-full px-3 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                    value={reportForm.location}
                    onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  বিস্তারিত প্রতিবেদন *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="ঘটনার তারিখ, স্থান ও বিস্তারিত বিবরণ..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                  value={reportForm.content}
                  onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800 transition-colors inline-flex items-center gap-2"
              >
                <Send size={14} /> সংবাদ প্রকাশ করুন
              </button>
            </form>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">নাম *</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ইমেইল বা ফোন *
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">বিষয় *</label>
                <input
                  required
                  type="text"
                  className="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">বার্তা *</label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800 transition-colors"
              >
                বার্তা পাঠান
              </button>
            </form>
          )}
        </div>

        <aside className="md:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-6 space-y-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 pb-2.5 border-b border-slate-200">
              কার্যালয়ের ঠিকানা
            </h3>
            <dl className="divide-y divide-slate-200 text-xs">
              <div className="py-2.5">
                <dt className="text-slate-500">বার্তা ও সম্পাদকীয় দপ্তর</dt>
                <dd className="font-medium text-slate-900 mt-1">
                  দরগাহপুর বাজার, আশাশুনি, সাতক্ষীরা।
                </dd>
              </div>
              <div className="py-2.5">
                <dt className="text-slate-500">ইমেইল</dt>
                <dd className="font-mono text-slate-900 mt-1">news@dargahpur.org</dd>
              </div>
              <div className="py-2.5">
                <dt className="text-slate-500">ফোন</dt>
                <dd className="font-mono tabular-nums text-slate-900 mt-1">+৮৮০ ১৭১২-৩৪৫৬৭৮</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto bg-white border border-slate-200 p-8 sm:p-10 space-y-5 text-slate-800 leading-relaxed">
    <div className="border-b border-slate-200 pb-4">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">নীতিমালা</span>
      <h1 className="font-serif text-3xl font-bold text-slate-950 mt-1">গোপনীয়তা নীতি</h1>
    </div>
    <p>
      দরগাহপুর সংবাদ পাঠকদের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় সর্বোচ্চ গুরুত্ব প্রদান করে। মন্তব্য বা সংবাদ প্রেরণের সময় প্রদত্ত নাম ও ইমেইল কেবল সম্পাদকীয় যোগাযোগের জন্য ব্যবহৃত হয়।
    </p>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto bg-white border border-slate-200 p-8 sm:p-10 space-y-5 text-slate-800 leading-relaxed">
    <div className="border-b border-slate-200 pb-4">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">শর্তাবলী</span>
      <h1 className="font-serif text-3xl font-bold text-slate-950 mt-1">ব্যবহারের শর্তাবলী</h1>
    </div>
    <p>
      দরগাহপুর সংবাদ পোর্টালে প্রকাশিত সকল প্রতিবেদন ও আলোকচিত্রের স্বত্ব সংরক্ষিত। তথ্যসূত্র উল্লেখপূর্বক শিক্ষা ও জনস্বার্থে প্রতিবেদন শেয়ার করা যাবে।
    </p>
  </div>
);
