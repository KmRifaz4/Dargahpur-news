
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Layers, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Settings, 
  Plus, 
  LogOut,
  Layout as LayoutIcon,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Globe
} from 'lucide-react';
import { Post, Comment, Category } from '../types';

export const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const navigate = useNavigate();
  const session = storageService.getSession();

  useEffect(() => {
    if (!session) {
      navigate('/login');
    }
    setPosts(storageService.getPosts());
    setComments(storageService.getComments());
  }, [session, navigate]);

  const handleLogout = () => {
    storageService.setSession(null);
    navigate('/');
  };

  const pendingComments = comments.filter(c => !c.approved);
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);

  const stats = [
    { label: 'মোট পোস্ট', value: posts.length, icon: FileText, color: 'bg-blue-500' },
    // Fix: Count categories by calling the service method
    { label: 'মোট ক্যাটাগরি', value: storageService.getCategories().length, icon: Layers, color: 'bg-purple-500' },
    { label: 'পেন্ডিং মন্তব্য', value: pendingComments.length, icon: MessageSquare, color: 'bg-orange-500' },
    { label: 'মোট পাঠক', value: totalViews, icon: TrendingUp, color: 'bg-green-500' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Admin Panel</h1>
          <p className="text-xs text-gray-400 mt-1">Dargahpur News Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 p-3 rounded-lg bg-primary text-white font-medium">
            <LayoutIcon size={20} /> ড্যাশবোর্ড
          </Link>
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <Globe size={20} /> ওয়েবসাইট দেখুন
          </Link>
          <Link to="/admin/posts" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <FileText size={20} /> পোস্টসমূহ
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <Layers size={20} /> ক্যাটাগরি
          </Link>
          <Link to="/admin/comments" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <MessageSquare size={20} /> মন্তব্য
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <Users size={20} /> ইউজারসমূহ
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
            <Settings size={20} /> সেটিংস
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-900/20 w-full text-left"
          >
            <LogOut size={20} /> লগ আউট
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">স্বাগতম, {session?.username}</h2>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">{session?.role}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
              <Globe size={18} /> ওয়েবসাইট
            </Link>
            <Link 
              to="/admin/posts/new" 
              className="bg-primary text-white py-2 px-4 rounded-lg font-bold flex items-center gap-2 hover:bg-red-800 transition-colors"
            >
              <Plus size={18} /> নতুন পোস্ট
            </Link>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-6">
                <div className={`${stat.color} p-4 rounded-xl text-white`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString('bn-BD')}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Posts */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="text-blue-500" /> সাম্প্রতিক পোস্টসমূহ
                </h3>
                <Link to="/admin/posts" className="text-primary text-sm font-bold flex items-center">
                  সব দেখুন <ChevronRight size={16} />
                </Link>
              </div>
              <div className="space-y-4">
                {posts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={post.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{post.title}</p>
                        <p className="text-xs text-gray-500">{post.category} • {new Date(post.publishDate).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Eye size={16} /> <span className="text-xs font-bold">{post.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pending Comments */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="text-orange-500" /> পেন্ডিং মন্তব্য
                </h3>
                <Link to="/admin/comments" className="text-primary text-sm font-bold flex items-center">
                  সব দেখুন <ChevronRight size={16} />
                </Link>
              </div>
              <div className="space-y-4">
                {pendingComments.length > 0 ? (
                  pendingComments.slice(0, 5).map(comment => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{comment.author}</p>
                          <p className="text-xs text-gray-500">{comment.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-green-600 p-1 hover:bg-green-100 rounded" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button className="text-red-600 p-1 hover:bg-red-100 rounded" title="Delete">
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 italic">"{comment.content}"</p>
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Clock size={10} /> {new Date(comment.date).toLocaleString('bn-BD')}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    কোন পেন্ডিং মন্তব্য নেই।
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
