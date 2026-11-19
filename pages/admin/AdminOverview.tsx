import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Post, Comment } from '../../types';
import { EditorialImage } from '../../components/EditorialImage';

export const AdminOverview: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    setPosts(storageService.getPosts());
    setComments(storageService.getComments());
  }, []);

  const pendingComments = comments.filter((c) => !c.approved);
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);

  const stats = [
    { label: 'মোট প্রকাশিত সংবাদ', value: posts.length },
    { label: 'সংবাদ বিভাগ', value: storageService.getCategories().length },
    { label: 'অপেক্ষমাণ মন্তব্য', value: pendingComments.length },
    { label: 'সর্বমোট পাঠ সংখ্যা', value: totalViews }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 border border-slate-200 flex flex-col justify-between"
          >
            <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
            <p className="font-serif text-3xl font-bold text-slate-900 mt-2 tabular-nums">
              {stat.value.toLocaleString('bn-BD')}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <h3 className="font-serif text-lg font-bold text-slate-900">সাম্প্রতিক প্রকাশিত সংবাদ</h3>
            <Link
              to="/admin/posts"
              className="text-primary text-xs font-semibold flex items-center hover:underline"
            >
              সবগুলো দেখুন <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-200/80">
            {posts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
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
                      to={`/admin/posts/edit/${post.id}`}
                      className="font-semibold text-sm text-slate-900 hover:text-primary truncate block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {post.category} · {new Date(post.publishDate).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums shrink-0">
                  {post.views.toLocaleString('bn-BD')} পাঠ
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <h3 className="font-serif text-lg font-bold text-slate-900">অপেক্ষমাণ মন্তব্য</h3>
            <Link
              to="/admin/comments"
              className="text-primary text-xs font-semibold flex items-center hover:underline"
            >
              সবগুলো দেখুন <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {pendingComments.length > 0 ? (
              pendingComments.slice(0, 5).map((comment) => (
                <div key={comment.id} className="p-4 bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{comment.author}</p>
                      <p className="text-xs text-slate-500">{comment.email}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...comment, approved: true };
                          storageService.updateComment(updated);
                          setComments(storageService.getComments());
                        }}
                        className="text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                        title="অনুমোদন দিন"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          storageService.deleteComment(comment.id);
                          setComments(storageService.getComments());
                        }}
                        className="text-red-700 p-1 hover:bg-red-50 rounded"
                        title="মুছে ফেলুন"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2">“{comment.content}”</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                বর্তমানে অনুমোদনের অপেক্ষায় কোনো মন্তব্য নেই।
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
