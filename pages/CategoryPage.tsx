import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Post, Category } from '../types';
import { NewsCard } from '../components/NewsCard';
import { Search, ArrowLeft } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  useEffect(() => {
    window.scrollTo(0, 0);
    setPosts(storageService.getPosts());
    setCategories(storageService.getCategories());
    setBookmarks(storageService.getBookmarks());
  }, [decodedName]);

  const currentCategory = categories.find((c) => c.name === decodedName);

  const categoryPosts = useMemo(() => {
    return posts
      .filter((p) => {
        const matchesCat = !decodedName || p.category === decodedName;
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.views - a.views;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });
  }, [posts, decodedName, searchQuery, sortBy]);

  const handleToggleBookmark = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks(storageService.toggleBookmark(postId));
  };

  return (
    <div className="space-y-8">
      <header className="bg-slate-50 border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900">
            প্রচ্ছদ
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-primary">{decodedName}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950">
              {decodedName}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentCategory?.description ||
                `দরগাহপুর সংবাদে প্রকাশিত ${decodedName} বিভাগের সর্বশেষ প্রতিবেদন।`}
            </p>
          </div>
          <div className="text-xs text-slate-500 tabular-nums shrink-0">
            মোট প্রতিবেদন: <span className="font-semibold text-slate-900">{categoryPosts.length.toLocaleString('bn-BD')}টি</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.name}`}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                cat.name === decodedName
                  ? 'bg-primary text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${decodedName} বিভাগে খুঁজুন...`}
            className="w-full pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-sm text-xs text-slate-900 focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSortBy('latest')}
            className={`px-3 py-1 rounded-xs text-xs font-medium ${
              sortBy === 'latest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            সর্বশেষ
          </button>
          <button
            type="button"
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1 rounded-xs text-xs font-medium ${
              sortBy === 'popular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            জনপ্রিয়
          </button>
        </div>
      </div>

      {categoryPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryPosts.map((post) => (
            <NewsCard
              key={post.id}
              post={post}
              isBookmarked={bookmarks.includes(post.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-12 text-center space-y-4">
          <h2 className="font-serif text-xl font-bold text-slate-900">
            এই বিভাগে এখনো কোনো সংবাদ প্রকাশিত হয়নি
          </h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800 transition-colors"
          >
            <ArrowLeft size={14} /> প্রচ্ছদে ফিরে যান
          </Link>
        </div>
      )}
    </div>
  );
};
