import React, { useState, useEffect, useMemo } from 'react';
import { storageService, getRelativeTimeBn } from '../services/storageService';
import { Post, Category } from '../types';
import { NewsCard } from '../components/NewsCard';
import { EditorialImage } from '../components/EditorialImage';
import {
  Search,
  ArrowRight,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('সকল');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [railTab, setRailTab] = useState<'latest' | 'popular'>('latest');
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [tickerPaused, setTickerPaused] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [activeBulletinIdx, setActiveBulletinIdx] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const settings = storageService.getSettings();

  useEffect(() => {
    setPosts(storageService.getPosts());
    setCategories(storageService.getCategories());
    setBookmarks(storageService.getBookmarks());
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (tickerPaused || posts.length <= 1) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [tickerPaused, posts.length]);

  const handleToggleBookmark = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = storageService.toggleBookmark(postId);
    setBookmarks(updated);
  };

  const sortedLatestPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }, [posts]);

  const popularPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.views - a.views);
  }, [posts]);

  const leadPost = useMemo(() => {
    return sortedLatestPosts.find((p) => p.featured) || sortedLatestPosts[0];
  }, [sortedLatestPosts]);

  const subLeadPosts = useMemo(() => {
    if (!leadPost) return [];
    return sortedLatestPosts.filter((p) => p.id !== leadPost.id).slice(0, 3);
  }, [sortedLatestPosts, leadPost]);

  const bulletinPosts = useMemo(() => sortedLatestPosts.slice(0, 4), [sortedLatestPosts]);
  const activeBulletin = bulletinPosts[activeBulletinIdx] || bulletinPosts[0];

  const handleToggleBulletinAudio = (post: Post) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${post.title}। ${post.excerpt}`);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesCat = activeCategory === 'সকল' || post.category === activeCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.author.toLowerCase().includes(q) ||
          post.category.toLowerCase().includes(q);
        const matchesBookmark = !showBookmarksOnly || bookmarks.includes(post.id);
        return matchesCat && matchesQuery && matchesBookmark;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.views - a.views;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });
  }, [posts, activeCategory, searchQuery, showBookmarksOnly, bookmarks, sortBy]);

  const todayFormatted = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isDefaultView = !searchQuery && !showBookmarksOnly && activeCategory === 'সকল';

  return (
    <div className="space-y-8">
      {/* Operational Date, Search & Breaking News Channel Strip */}
      <section className="space-y-3 border-b border-slate-200 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{todayFormatted}</span>
            <span aria-hidden="true">·</span>
            <span>দরগাহপুর, আশাশুনি, সাতক্ষীরা</span>
            <span aria-hidden="true">·</span>
            <span>অনলাইন সংস্করণ</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সংবাদ খুঁজুন..."
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-sm text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="অনুসন্ধান মুছুন"
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                showBookmarksOnly
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              <Bookmark size={13} fill={showBookmarksOnly ? 'currentColor' : 'none'} />
              <span>সংরক্ষিত ({bookmarks.length.toLocaleString('bn-BD')})</span>
            </button>

            <Link
              to="/php-export"
              className="px-3 py-1.5 rounded-sm text-xs font-semibold border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download size={13} />
              <span>PHP সাইট ডাউনলোড</span>
            </Link>
          </div>
        </div>

        {/* Authentic News Channel Breaking Strip */}
        {settings.breakingNewsEnabled && posts.length > 0 && (
          <div className="border border-slate-200 bg-slate-50 flex items-center justify-between overflow-hidden">
            <div className="flex items-center min-w-0 flex-1">
              <span className="bg-primary text-white text-xs font-bold px-3.5 py-2 whitespace-nowrap shrink-0 tracking-wide">
                সদ্যপ্রাপ্ত
              </span>
              <Link
                to={`/post/${posts[tickerIndex % posts.length].id}`}
                className="px-4 py-2 text-sm font-medium text-slate-900 hover:text-primary transition-colors truncate flex-1"
              >
                {posts[tickerIndex % posts.length].title}
              </Link>
              <span className="hidden sm:inline text-xs text-slate-500 pr-3 whitespace-nowrap shrink-0">
                {getRelativeTimeBn(posts[tickerIndex % posts.length].publishDate)}
              </span>
            </div>

            <div className="flex items-center border-l border-slate-200 shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setTickerPaused(!tickerPaused)}
                aria-label={tickerPaused ? 'চালু করুন' : 'থামান'}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {tickerPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setTickerIndex((prev) => (prev - 1 + posts.length) % posts.length)}
                aria-label="পূর্ববর্তী শিরোনাম"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-l border-slate-200 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setTickerIndex((prev) => (prev + 1) % posts.length)}
                aria-label="পরবর্তী শিরোনাম"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-l border-slate-200 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Authentic 3-Column Newspaper Front Page Grid */}
      {isDefaultView && leadPost && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-slate-200 pb-10">
          {/* Left 8 Columns: Dominant Lead Story + 3 Sub-Leads */}
          <div className="lg:col-span-8 space-y-6 lg:border-r lg:border-slate-200 lg:pr-8">
            {/* Lead Story */}
            <article className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7 order-2 md:order-1 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Link
                    to={`/category/${leadPost.category}`}
                    className="font-bold text-primary hover:underline"
                  >
                    {leadPost.category}
                  </Link>
                  <span aria-hidden="true">·</span>
                  <span>{getRelativeTimeBn(leadPost.publishDate)}</span>
                  {leadPost.location && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{leadPost.location}</span>
                    </>
                  )}
                </div>

                <Link to={`/post/${leadPost.id}`}>
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-950 group-hover:text-primary transition-colors leading-[1.24]">
                    {leadPost.title}
                  </h1>
                </Link>

                {leadPost.subtitle && (
                  <p className="text-base font-medium text-slate-700 leading-snug">
                    {leadPost.subtitle}
                  </p>
                )}

                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {leadPost.excerpt}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>প্রতিবেদক: {leadPost.author}</span>
                  <Link
                    to={`/post/${leadPost.id}`}
                    className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>বিস্তারিত</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <Link
                to={`/post/${leadPost.id}`}
                className="md:col-span-5 order-1 md:order-2 aspect-[4/3] md:aspect-[16/12] overflow-hidden rounded-xs border border-slate-200 block"
              >
                <EditorialImage
                  src={leadPost.imageUrl}
                  alt={leadPost.title}
                  category={leadPost.category}
                  className="w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                />
              </Link>
            </article>

            {/* 3-Column Sub-Lead Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
              {subLeadPosts.map((post) => (
                <article key={post.id} className="group flex flex-col justify-between space-y-2.5">
                  <div>
                    <Link
                      to={`/post/${post.id}`}
                      className="block aspect-[16/10] overflow-hidden rounded-xs border border-slate-200 mb-3"
                    >
                      <EditorialImage
                        src={post.imageUrl}
                        alt={post.title}
                        category={post.category}
                        className="w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                      <Link
                        to={`/category/${post.category}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {post.category}
                      </Link>
                      <span aria-hidden="true">·</span>
                      <span>{getRelativeTimeBn(post.publishDate)}</span>
                    </div>
                    <Link to={`/post/${post.id}`}>
                      <h2 className="font-serif text-[17px] font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Right 4 Columns: News Channel Live Feed (সর্বশেষ / সর্বাধিক পঠিত) + Bazar Rates */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Signature Bangladeshi News Portal Tabbed Rail */}
            <div className="border border-slate-200 bg-white">
              <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setRailTab('latest')}
                  className={`py-2.5 text-sm font-bold transition-colors border-b-2 ${
                    railTab === 'latest'
                      ? 'border-primary text-primary bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সর্বশেষ
                </button>
                <button
                  type="button"
                  onClick={() => setRailTab('popular')}
                  className={`py-2.5 text-sm font-bold transition-colors border-b-2 ${
                    railTab === 'popular'
                      ? 'border-primary text-primary bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সর্বাধিক পঠিত
                </button>
              </div>

              <div className="p-4">
                {(railTab === 'latest' ? sortedLatestPosts : popularPosts)
                  .slice(0, 5)
                  .map((post, idx) => (
                    <NewsCard
                      key={post.id}
                      post={post}
                      compact
                      indexNumber={
                        railTab === 'popular'
                          ? `${(idx + 1).toLocaleString('bn-BD')}.`
                          : undefined
                      }
                    />
                  ))}
              </div>
            </div>

            {/* Realistic Local Village Market Rates (দরগাহপুর হাটের বাজার দর) */}
            <div className="border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
                <h3 className="font-serif text-base font-bold text-slate-900">
                  দরগাহপুর হাটের আজকের দর
                </h3>
                <span className="text-xs text-slate-500">প্রতি কেজি (টাকা)</span>
              </div>
              <dl className="divide-y divide-slate-200/80 text-xs">
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-700">নতুন আমন চাল (মোটা / চিকন)</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">৫২ – ৬৮ ৳</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-700">দেশি পেঁয়াজ</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">৮৫ – ৯০ ৳</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-700">আলু (নতুন / পুরোনো)</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">৪৮ – ৫৫ ৳</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-700">দেশি রুই মাছ (১ কেজি+)</dt>
                  <dd className="font-mono font-semibold text-slate-900 tabular-nums">২৮০ – ৩২০ ৳</dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      )}

      {/* Broadcast News Bulletin Desk (দরগাহপুর সংবাদ বুলেটিন) */}
      {isDefaultView && activeBulletin && (
        <section className="bg-slate-950 text-white p-6 sm:p-8 border-t-4 border-primary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-6 border-b border-slate-800">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                সংবাদ বুলেটিন ও অডিও সারসংক্ষেপ
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                দিনের গুরুত্বপূর্ণ প্রতিবেদনগুলো এক নজরে শুনুন অথবা পড়ুন
              </p>
            </div>
            <Link
              to={`/post/${activeBulletin.id}`}
              className="text-xs font-semibold text-red-400 hover:text-red-300 inline-flex items-center gap-1"
            >
              <span>পূর্ণাঙ্গ প্রতিবেদন পড়ুন</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Active Bulletin Card */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-xs border border-slate-800 bg-slate-900 flex flex-col justify-between">
              <div className="aspect-[16/9] relative overflow-hidden">
                <EditorialImage
                  src={activeBulletin.imageUrl}
                  alt={activeBulletin.title}
                  category={activeBulletin.category}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="font-semibold text-red-400">{activeBulletin.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{getRelativeTimeBn(activeBulletin.publishDate)}</span>
                  </div>
                  <Link to={`/post/${activeBulletin.id}`}>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white hover:text-red-300 transition-colors leading-snug">
                      {activeBulletin.title}
                    </h3>
                  </Link>
                </div>
              </div>

              <div className="p-4 sm:px-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-300 line-clamp-1 flex-1 min-w-[200px]">
                  {activeBulletin.excerpt}
                </p>
                <button
                  type="button"
                  onClick={() => handleToggleBulletinAudio(activeBulletin)}
                  className="px-3.5 py-1.5 bg-primary hover:bg-red-800 text-white text-xs font-semibold rounded-sm inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isSpeaking ? 'শোনা বন্ধ করুন' : 'সংবাদ বুলেটিন শুনুন'}</span>
                </button>
              </div>
            </div>

            {/* Bulletin Playlist Switcher */}
            <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-800 border border-slate-800 bg-slate-900/60">
              {bulletinPosts.map((post, idx) => {
                const isSelected = idx === activeBulletinIdx;
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                      setIsSpeaking(false);
                      setActiveBulletinIdx(idx);
                    }}
                    className={`p-4 text-left flex items-center gap-3.5 transition-colors ${
                      isSelected ? 'bg-slate-800/90' : 'hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-24 aspect-[16/10] rounded-xs overflow-hidden shrink-0 border border-slate-700">
                      <EditorialImage
                        src={post.imageUrl}
                        alt={post.title}
                        category={post.category}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                        <span className={isSelected ? 'text-red-400 font-semibold' : ''}>
                          {post.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{getRelativeTimeBn(post.publishDate)}</span>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-white line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Main Category Filterable News Stream & Local Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Left 8 Columns: Department Tabs + Article Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-900">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('সকল');
                  setVisibleCount(6);
                }}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeCategory === 'সকল'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                সকল সংবাদ
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setVisibleCount(6);
                  }}
                  className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeCategory === cat.name
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1 rounded-xs text-xs font-medium transition-colors whitespace-nowrap ${
                  sortBy === 'latest'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সর্বশেষ
              </button>
              <button
                type="button"
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-xs text-xs font-medium transition-colors whitespace-nowrap ${
                  sortBy === 'popular'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                জনপ্রিয়
              </button>
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.slice(0, visibleCount).map((post) => (
                  <NewsCard
                    key={post.id}
                    post={post}
                    isBookmarked={bookmarks.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>

              {visibleCount < filteredPosts.length && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 4)}
                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-800 rounded-sm text-xs font-semibold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
                  >
                    আরও সংবাদ দেখুন ({(filteredPosts.length - visibleCount).toLocaleString('bn-BD')}টি বাকি)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-10 text-center space-y-3">
              <p className="font-serif text-lg font-semibold text-slate-800">
                কোনো সংবাদ পাওয়া যায়নি
              </p>
              <p className="text-xs text-slate-500">
                অনুসন্ধান শব্দ পরিবর্তন করুন অথবা সকল বিভাগ নির্বাচন করুন।
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('সকল');
                  setSearchQuery('');
                  setShowBookmarksOnly(false);
                }}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800 transition-colors"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          )}
        </div>

        {/* Right 4 Columns: Local Civic Directory & Citizen Dispatch */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="border border-slate-200 bg-white p-5">
            <div className="pb-3 mb-3 border-b border-slate-200">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                দরগাহপুর জরুরি সেবা ও তথ্য
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ইউনিয়ন স্বাস্থ্য, কৃষি ও জরুরি যোগাযোগ নম্বর
              </p>
            </div>

            <dl className="divide-y divide-slate-200/80 text-xs">
              <div className="py-2.5 flex justify-between gap-2">
                <dt className="text-slate-600">ইউনিয়ন পরিষদ অফিস</dt>
                <dd className="font-medium text-slate-900 tabular-nums">সকাল ৯:০০ – বিকাল ৫:০০</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <dt className="text-slate-600">স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র</dt>
                <dd className="font-mono font-medium text-slate-900 tabular-nums">+৮৮০ ১৭১১-২২৩৩৪৪</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <dt className="text-slate-600">কৃষি পরামর্শ কল সেন্টার</dt>
                <dd className="font-mono font-medium text-slate-900 tabular-nums">১৬১২৩</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <dt className="text-slate-600">পল্লী বিদ্যুৎ অভিযোগ কেন্দ্র</dt>
                <dd className="font-mono font-medium text-slate-900 tabular-nums">+৮৮০ ১৭৬৯-৪০৫০৬০</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <dt className="text-slate-600">জামাতের সময় (ফজর / মাগরিব)</dt>
                <dd className="font-medium text-slate-900 tabular-nums">ভোর ৫:০৫ · সন্ধ্যা ৫:৩৮</dd>
              </div>
            </dl>
          </section>

          <section className="border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">
              নাগরিক সংবাদদাতা
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
              আপনার এলাকার খবর ও ছবি পাঠান
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              দরগাহপুর ও আশাশুনির যেকোনো জনগুরুত্বপূর্ণ সমস্যা, উন্নয়ন কিংবা আয়োজনের সংবাদ আমাদের বার্তা কক্ষে পাঠাতে পারেন।
            </p>
            <div className="pt-1">
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-sm hover:bg-primary transition-colors"
              >
                <span>সংবাদ প্রেরণ ফর্ম</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Home;
