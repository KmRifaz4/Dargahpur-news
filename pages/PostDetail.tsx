import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storageService, getRelativeTimeBn } from '../services/storageService';
import { Post, Comment } from '../types';
import { EditorialImage } from '../components/EditorialImage';
import { NewsCard } from '../components/NewsCard';
import { Share2, Printer, Bookmark, Check, ArrowLeft } from 'lucide-react';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copied, setCopied] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [newComment, setNewComment] = useState({ author: '', email: '', content: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    const allPosts = storageService.getPosts();
    const found = allPosts.find((x) => x.id === id);
    if (found) {
      const updatedPost = { ...found, views: found.views + 1 };
      setPost(updatedPost);
      storageService.savePost(updatedPost);

      const related = allPosts
        .filter((p) => p.id !== found.id && (p.category === found.category || p.featured))
        .slice(0, 4);
      setRelatedPosts(related);
      setLatestPosts(
        [...allPosts]
          .filter((p) => p.id !== found.id)
          .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
          .slice(0, 4)
      );
    } else {
      setPost(null);
    }
    setComments(storageService.getComments().filter((c) => c.postId === id && c.approved));
    setBookmarks(storageService.getBookmarks());
    setCommentSubmitted(false);
  }, [id]);

  if (!post) {
    return (
      <div className="bg-slate-50 border border-slate-200 p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <h1 className="font-serif text-2xl font-bold text-slate-900">সংবাদটি খুঁজে পাওয়া যায়নি</h1>
        <p className="text-sm text-slate-600">
          আপনি যে প্রতিবেদনটি খুঁজছেন তা হয়তো স্থানান্তরিত বা মুছে ফেলা হয়েছে।
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800 transition-colors"
        >
          <ArrowLeft size={14} /> প্রচ্ছদে ফিরে যান
        </Link>
      </div>
    );
  }

  const date = new Date(post.publishDate).toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isBookmarked = bookmarks.includes(post.id);

  const handleToggleBookmark = () => {
    setBookmarks(storageService.toggleBookmark(post.id));
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      postId: post.id,
      author: newComment.author.trim(),
      email: newComment.email.trim(),
      content: newComment.content.trim(),
      date: new Date().toISOString(),
      approved: false
    };
    storageService.addComment(comment);
    setCommentSubmitted(true);
    setNewComment({ author: '', email: '', content: '' });
  };

  const proseSizeClass =
    fontSize === 'xlarge'
      ? 'text-xl leading-[1.9]'
      : fontSize === 'large'
      ? 'text-lg leading-[1.85]'
      : 'text-base sm:text-[17px] leading-[1.8]';

  const paragraphs = post.content.split('\n').filter((p) => p.trim().length > 0);

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2 border-b border-slate-200 pb-3 no-print">
        <Link to="/" className="hover:text-slate-900 transition-colors">
          প্রচ্ছদ
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/category/${post.category}`} className="font-semibold text-primary hover:underline">
          {post.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-600 truncate max-w-md">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Column */}
        <article className="lg:col-span-8 bg-white lg:border-r lg:border-slate-200 lg:pr-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
            <Link
              to={`/category/${post.category}`}
              className="font-bold text-primary hover:underline"
            >
              {post.category}
            </Link>
            <span aria-hidden="true">·</span>
            <span>প্রকাশ: {date} ({getRelativeTimeBn(post.publishDate)})</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{post.views.toLocaleString('bn-BD')} পাঠ</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-950 leading-[1.24] mb-3">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-snug mb-5">
              {post.subtitle}
            </p>
          )}

          {/* Byline & Utility Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 mb-6 border-y border-slate-200 text-xs">
            <div>
              <span className="font-semibold text-slate-900 text-sm">{post.author}</span>
              {post.authorRole && <span className="text-slate-500"> · {post.authorRole}</span>}
              {post.location && <span className="text-slate-500"> · {post.location}</span>}
            </div>

            <div className="flex items-center gap-2 no-print">
              <div className="flex items-center bg-slate-100 rounded-sm p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-1 rounded-xs text-xs font-medium ${
                    fontSize === 'normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  অ
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 rounded-xs text-xs font-medium ${
                    fontSize === 'large' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  অ+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-1 rounded-xs text-xs font-medium ${
                    fontSize === 'xlarge' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  অ++
                </button>
              </div>

              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`px-3 py-1.5 rounded-sm border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isBookmarked
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
                <span>{isBookmarked ? 'সংরক্ষিত' : 'সংরক্ষণ'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-sm border border-slate-200 bg-white text-slate-700 hover:border-slate-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-700" /> : <Share2 size={13} />}
                <span>{copied ? 'কপি হয়েছে' : 'শেয়ার'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                aria-label="প্রিন্ট করুন"
                className="p-1.5 rounded-sm border border-slate-200 bg-white text-slate-700 hover:border-slate-400 transition-colors"
              >
                <Printer size={14} />
              </button>
            </div>
          </div>

          {/* Press Photo */}
          <div className="mb-8">
            <div className="aspect-[16/9] rounded-xs overflow-hidden border border-slate-200">
              <EditorialImage
                src={post.imageUrl}
                alt={post.title}
                category={post.category}
                className="w-full h-full"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {post.imageCaption || `${post.title} — ছবি: দরগাহপুর সংবাদ`}
            </p>
          </div>

          {/* Body Prose */}
          <div className={`max-w-2xl text-slate-800 space-y-5 ${proseSizeClass}`}>
            {paragraphs.map((para, index) => (
              <React.Fragment key={index}>
                <p
                  className={
                    index === 0
                      ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary'
                      : ''
                  }
                >
                  {para}
                </p>

                {index === 1 && post.pullQuote && (
                  <blockquote className="my-6 py-5 border-y border-slate-200 font-serif text-xl italic text-slate-900 leading-snug">
                    “{post.pullQuote}”
                  </blockquote>
                )}
              </React.Fragment>
            ))}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">বিষয়:</span>
              {post.tags.map((tag, idx) => (
                <React.Fragment key={tag}>
                  <span>{tag}</span>
                  {idx < post.tags.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </article>

        {/* Right Newsroom Sidebar */}
        <aside className="lg:col-span-4 space-y-8 no-print">
          <section className="border border-slate-200 bg-white p-5">
            <h3 className="font-serif text-lg font-bold text-slate-900 pb-3 mb-4 border-b border-slate-200">
              সর্বশেষ সংবাদ
            </h3>
            <div>
              {latestPosts.map((rel) => (
                <NewsCard key={rel.id} post={rel} compact />
              ))}
            </div>
          </section>

          <section className="border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-serif text-lg font-bold text-slate-900 pb-3 mb-4 border-b border-slate-200">
              এ সম্পর্কিত আরও খবর
            </h3>
            <div>
              {relatedPosts.map((rel, idx) => (
                <NewsCard
                  key={rel.id}
                  post={rel}
                  compact
                  indexNumber={`${(idx + 1).toLocaleString('bn-BD')}.`}
                />
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Comments Section */}
      <section className="max-w-4xl border border-slate-200 bg-white p-6 sm:p-8 no-print">
        <div className="pb-3 mb-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-slate-900">
            পাঠকের মন্তব্য ({comments.length.toLocaleString('bn-BD')})
          </h3>
          <span className="text-xs text-slate-500">যাচাইকৃত মন্তব্য প্রকাশিত হয়</span>
        </div>

        <div className="space-y-5 mb-8">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="pb-4 border-b border-slate-200 last:border-b-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                  <span className="font-semibold text-slate-900 text-sm">{comment.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{getRelativeTimeBn(comment.date)}</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm">
              এই প্রতিবেদনে এখনো কোনো মন্তব্য নেই।
            </p>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5">
          <h4 className="font-serif text-base font-bold text-slate-900 mb-4">মতামত লিখুন</h4>

          {commentSubmitted && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
              আপনার মন্তব্যটি অনুমোদনের জন্য জমা হয়েছে। ধন্যবাদ।
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম *</label>
                <input
                  required
                  type="text"
                  placeholder="পূর্ণ নাম"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400"
                  value={newComment.author}
                  onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ইমেইল *</label>
                <input
                  required
                  type="email"
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400"
                  value={newComment.email}
                  onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মন্তব্য *</label>
              <textarea
                required
                rows={3}
                placeholder="প্রতিবেদন সম্পর্কে আপনার মতামত..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-slate-400"
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800 transition-colors"
            >
              মতামত পাঠান
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PostDetail;
