import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { MenuItem } from '../types';
import { storageService } from '../services/storageService';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const settings = storageService.getSettings();
  const session = storageService.getSession();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuItems(storageService.getMenuItems().slice(0, 5));
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white">
      {/* Strict 3-Zone News Channel Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 no-print">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Masthead Wordmark */}
          <Link
            to="/"
            className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-950 hover:text-primary transition-colors whitespace-nowrap shrink-0"
          >
            {settings.siteName}
          </Link>

          {/* Zone 2: 5 Single-Line Section Links */}
          <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-slate-700">
            {menuItems.map((item) => {
              const isActive = decodeURIComponent(location.pathname) === item.url;
              return (
                <Link
                  key={item.id}
                  to={item.url}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'border-primary text-slate-950 font-semibold'
                      : 'border-transparent hover:text-slate-950 hover:border-slate-400'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Drawer Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate(session ? '/admin' : '/contact')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-primary rounded-sm hover:bg-red-800 transition-colors whitespace-nowrap shrink-0"
            >
              {session ? 'অ্যাডমিন প্যানেল' : 'সংবাদ পাঠান'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="মেনু খুলুন"
              className="md:hidden p-2 text-slate-700 hover:text-slate-950 rounded-sm border border-slate-200 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 no-print">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-white border-l border-slate-200 p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <span className="font-serif font-bold text-lg text-slate-950">
                  {settings.siteName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="মেনু বন্ধ করুন"
                  className="p-2 text-slate-500 hover:text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = decodeURIComponent(location.pathname) === item.url;
                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2.5 text-base font-medium border-b border-slate-100 transition-colors ${
                        isActive ? 'text-primary font-semibold' : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 text-base font-medium border-b border-slate-100 text-slate-700 hover:text-slate-950"
                >
                  আমাদের সম্পর্কে
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 text-base font-medium text-slate-700 hover:text-slate-950"
                >
                  সংবাদ ও মতামত পাঠান
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2.5 px-4 rounded-sm border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-colors"
              >
                বার্তা কক্ষ ও অ্যাডমিন প্যানেল
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1360px] mx-auto w-full px-4 sm:px-6 py-5 sm:py-8">
        {children}
      </main>

      {/* Authentic Bangladeshi Newspaper Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t-4 border-primary mt-14 no-print">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-slate-800">
            {/* Column 1: Newspaper Identity */}
            <div className="lg:col-span-5 space-y-3">
              <Link to="/" className="font-serif text-2xl font-bold text-white tracking-tight block">
                {settings.siteName}
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                {settings.tagline}
              </p>
              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <p>সম্পাদক ও প্রকাশক: {settings.editorName || 'শরিফুল ইসলাম'}</p>
                <p>বার্তা ও বাণিজ্যিক কার্যালয়: দরগাহপুর বাজার, আশাশুনি, সাতক্ষীরা</p>
              </div>
            </div>

            {/* Column 2: Sections */}
            <div className="lg:col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2.5 mb-3.5 border-b border-slate-800">
                বিভাগসমূহ
              </h3>
              <ul className="grid grid-cols-2 gap-2.5 text-sm">
                {storageService.getCategories().map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={`/category/${cat.name}`}
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Editorial & Policy Links */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2.5 mb-3.5 border-b border-slate-800">
                অন্যান্য পাতা
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                    আমাদের সম্পর্কে
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">
                    যোগাযোগ ও সংবাদ প্রেরণ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-300 hover:text-white transition-colors">
                    গোপনীয়তা নীতি
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-slate-300 hover:text-white transition-colors">
                    শর্তাবলী
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
                    অ্যাডমিন প্যানেল
                  </Link>
                </li>
                <li>
                  <Link to="/php-export" className="text-red-400 hover:text-white transition-colors font-medium">
                    PHP হোস্টিং প্যাক (.zip)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsroom Contact */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2.5 mb-3.5 border-b border-slate-800">
                বার্তা কক্ষ
              </h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>news@dargahpur.org</p>
                <p className="font-mono tabular-nums text-xs text-slate-300">+৮৮০ ১৭১২-৩৪৫৬৭৮</p>
                <div className="pt-2 flex items-center gap-3 text-xs font-medium">
                  <a
                    href={settings.socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ফেসবুক
                  </a>
                  <span>·</span>
                  <a
                    href={settings.socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ইউটিউব
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>{settings.footerText}</p>
            <p>সাতক্ষীরা, বাংলাদেশ থেকে প্রকাশিত</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
