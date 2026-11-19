import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Layers,
  MessageSquare,
  Users,
  Settings,
  Plus,
  LogOut,
  Layout as LayoutIcon,
  Globe,
  Menu as MenuIcon,
  Download
} from 'lucide-react';
import { storageService } from '../services/storageService';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = storageService.getSession();

  useEffect(() => {
    if (!session) navigate('/login');
  }, [session, navigate]);

  const handleLogout = () => {
    storageService.setSession(null);
    navigate('/');
  };

  const navItems = [
    { label: 'ড্যাশবোর্ড', path: '/admin', icon: LayoutIcon },
    { label: 'সংবাদ ও পোস্ট', path: '/admin/posts', icon: FileText },
    { label: 'বিভাগসমূহ', path: '/admin/categories', icon: Layers },
    { label: 'মেনু বিন্যাস', path: '/admin/menu', icon: MenuIcon },
    { label: 'মন্তব্য', path: '/admin/comments', icon: MessageSquare },
    { label: 'সম্পাদনা পর্ষদ', path: '/admin/users', icon: Users },
    { label: 'সেটিংস', path: '/admin/settings', icon: Settings },
    { label: 'PHP হোস্টিং ডাউনলোড', path: '/admin/php-export', icon: Download }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-950 text-slate-200 shrink-0 hidden md:flex flex-col fixed h-full z-40 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <Link to="/admin" className="font-serif text-xl font-bold text-white block">
            দরগাহপুর সংবাদ
          </Link>
          <p className="text-xs text-slate-400 mt-1">বার্তা কক্ষ ও সিএমএস</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 mb-5 transition-colors"
          >
            <Globe size={15} /> মূল ওয়েবসাইট দেখুন
          </Link>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-red-400 hover:bg-slate-900 w-full text-left text-xs font-semibold transition-colors"
          >
            <LogOut size={15} /> লগ আউট করুন
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white h-16 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30 border-b border-slate-200">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-900">
              {session?.fullName || session?.username}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">{session?.role}</span>
          </div>
          <Link
            to="/admin/posts/new"
            className="bg-primary text-white py-2 px-4 rounded-sm font-semibold text-xs flex items-center gap-1.5 hover:bg-red-800 transition-colors whitespace-nowrap"
          >
            <Plus size={15} /> নতুন সংবাদ প্রকাশ
          </Link>
        </header>

        <main className="p-6 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
};
