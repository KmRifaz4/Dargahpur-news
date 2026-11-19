import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { Comment } from '../../types';
import { CheckCircle, Trash2 } from 'lucide-react';

export const CommentManager: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    setComments(storageService.getComments());
  }, []);

  const handleApprove = (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (comment) {
      storageService.updateComment({ ...comment, approved: true });
      setComments(storageService.getComments());
    }
  };

  const handleDelete = (id: string) => {
    storageService.deleteComment(id);
    setComments(storageService.getComments());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">পাঠকের মন্তব্য ব্যবস্থাপনা</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          পাঠকদের প্রেরিত মন্তব্য যাচাই ও অনুমোদন করুন
        </p>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white p-6 border border-slate-200 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-sm text-slate-900">{comment.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{comment.email}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      comment.approved
                        ? 'text-emerald-700 font-semibold'
                        : 'text-amber-700 font-semibold'
                    }
                  >
                    {comment.approved ? 'প্রকাশিত' : 'অনুমোদনের অপেক্ষায়'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!comment.approved && (
                  <button
                    type="button"
                    onClick={() => handleApprove(comment.id)}
                    className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-sm hover:bg-emerald-100 font-semibold text-xs transition-colors"
                  >
                    <CheckCircle size={14} /> অনুমোদন দিন
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  className="p-1.5 text-red-700 hover:bg-red-50 rounded-sm transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-800 bg-slate-50 p-4 border border-slate-200/70">
              “{comment.content}”
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
              <span>{new Date(comment.date).toLocaleString('bn-BD')}</span>
              <span aria-hidden="true">·</span>
              <span>পোস্ট আইডি: #{comment.postId}</span>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="py-16 text-center text-xs text-slate-500 bg-white border border-slate-200">
            কোনো মন্তব্য পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  );
};
