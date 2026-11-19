import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { CATEGORY_FALLBACK_IMAGES, DEFAULT_NEWS_IMAGE } from '../../constants';
import { Post } from '../../types';
import { Edit, Trash2, Search, ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { EditorialImage } from '../../components/EditorialImage';

export const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setPosts(storageService.getPosts());
  }, []);

  const handleDelete = (id: string) => {
    storageService.deletePost(id);
    setPosts(storageService.getPosts());
    setConfirmDeleteId(null);
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">সংবাদ ও পোস্ট ব্যবস্থাপনা</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            সকল প্রকাশিত প্রতিবেদন সম্পাদনা ও ব্যবস্থাপনা করুন
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="শিরোনাম বা বিভাগ খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-xs focus:outline-none focus:border-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="px-6 py-3.5 font-semibold">সংবাদ শিরোনাম ও প্রতিবেদক</th>
                <th className="px-6 py-3.5 font-semibold">বিভাগ</th>
                <th className="px-6 py-3.5 font-semibold">প্রকাশের তারিখ</th>
                <th className="px-6 py-3.5 font-semibold text-right">পাঠ সংখ্যা</th>
                <th className="px-6 py-3.5 font-semibold text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-10 rounded-xs overflow-hidden shrink-0 border border-slate-200">
                        <EditorialImage
                          src={post.imageUrl}
                          alt={post.title}
                          category={post.category}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/post/${post.id}`}
                          className="font-semibold text-slate-900 hover:text-primary truncate max-w-md block"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {post.author} {post.featured ? '· প্রধান সংবাদ' : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-primary">
                    {post.category}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 tabular-nums">
                    {new Date(post.publishDate).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                    {post.views.toLocaleString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {confirmDeleteId === post.id ? (
                      <div className="inline-flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="px-2.5 py-1 bg-red-700 text-white rounded-sm font-semibold"
                        >
                          নিশ্চিত মুছুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900"
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/admin/posts/edit/${post.id}`}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
                          title="সম্পাদনা"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(post.id)}
                          className="p-1.5 text-red-700 hover:bg-red-50 rounded-sm"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPosts.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-500">
              কোনো সংবাদ খুঁজে পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const categories = storageService.getCategories();

  const [formData, setFormData] = useState<Post>({
    id: id || Math.random().toString(36).substring(2, 9),
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    category: categories[0]?.name || 'গ্রামের খবর',
    author: storageService.getSession()?.fullName || storageService.getSession()?.username || 'বার্তা ডেস্ক',
    location: 'দরগাহপুর',
    readTime: '৩ মিনিট পাঠ',
    publishDate: new Date().toISOString(),
    imageUrl: '',
    imageCaption: '',
    pullQuote: '',
    featured: false,
    views: 0,
    tags: ['দরগাহপুর']
  });

  useEffect(() => {
    if (id) {
      const existing = storageService.getPostById(id);
      if (existing) {
        setFormData(existing);
      } else {
        navigate('/admin/posts');
      }
    }
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    const finalPost: Post = {
      ...formData,
      imageUrl:
        formData.imageUrl.trim() ||
        CATEGORY_FALLBACK_IMAGES[formData.category] ||
        DEFAULT_NEWS_IMAGE,
      excerpt: formData.excerpt.trim() || formData.content.trim().substring(0, 140) + '...'
    };
    storageService.savePost(finalPost);
    navigate('/admin/posts');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/posts')}
          className="p-2 hover:bg-slate-200/70 rounded-sm transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          {id ? 'সংবাদ প্রতিবেদন সম্পাদনা করুন' : 'নতুন সংবাদ প্রতিবেদন প্রকাশ করুন'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 border border-slate-200 space-y-5"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            সংবাদের শিরোনাম *
          </label>
          <input
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm focus:bg-white focus:outline-none focus:border-slate-400 font-serif text-lg font-bold"
            placeholder="প্রধান শিরোনাম লিখুন"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
                excerpt: formData.excerpt || e.target.value
              })
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            উপ-শিরোনাম (Deck / Subtitle)
          </label>
          <input
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-slate-400"
            placeholder="সংবাদের সারসংক্ষেপ এক লাইনে"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">বিভাগ</label>
            <select
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-slate-400"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">প্রতিবেদকের নাম</label>
            <input
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-slate-400"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">স্থান</label>
            <input
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-slate-400"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ছবির লিঙ্ক (খালি রাখলে বিভাগ অনুযায়ী ছবি যুক্ত হবে)
            </label>
            <input
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-slate-400"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ছবির ক্যাপশন
            </label>
            <input
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-slate-400"
              placeholder="উদা: দরগাহপুর উচ্চ বিদ্যালয় মাঠ"
              value={formData.imageCaption || ''}
              onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            বিস্তারিত প্রতিবেদন *
          </label>
          <textarea
            required
            rows={10}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-slate-400 leading-relaxed"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            বিশেষ উদ্ধৃতি (Pull Quote)
          </label>
          <input
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:bg-white focus:outline-none focus:border-slate-400"
            value={formData.pullQuote || ''}
            onChange={(e) => setFormData({ ...formData, pullQuote: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200">
          <input
            type="checkbox"
            id="featured"
            className="w-4 h-4 rounded-sm text-primary focus:ring-primary cursor-pointer"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          />
          <label htmlFor="featured" className="text-xs font-semibold text-slate-800 cursor-pointer">
            এই প্রতিবেদনটিকে প্রথম পাতার প্রধান সংবাদ (Featured) হিসেবে প্রদর্শন করুন
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/admin/posts')}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            বাতিল
          </button>
          <button
            type="submit"
            className="bg-primary text-white text-xs font-semibold py-2.5 px-6 rounded-sm hover:bg-red-800 transition-colors"
          >
            {id ? 'সংবাদ আপডেট করুন' : 'সংবাদ প্রকাশ করুন'}
          </button>
        </div>
      </form>
    </div>
  );
};
