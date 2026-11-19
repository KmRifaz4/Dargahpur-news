import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { EditorialImage } from './EditorialImage';
import { getRelativeTimeBn } from '../services/storageService';
import { Bookmark } from 'lucide-react';

interface NewsCardProps {
  post: Post;
  horizontal?: boolean;
  compact?: boolean;
  indexNumber?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string, e: React.MouseEvent) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  post,
  horizontal = false,
  compact = false,
  indexNumber,
  isBookmarked = false,
  onToggleBookmark
}) => {
  const relativeTime = getRelativeTimeBn(post.publishDate);

  if (compact) {
    return (
      <article className="group py-3 first:pt-0 last:pb-0 border-b border-slate-200 last:border-b-0">
        <Link to={`/post/${post.id}`} className="flex items-start gap-3">
          {indexNumber ? (
            <span className="font-mono text-sm font-semibold text-slate-400 tabular-nums pt-0.5 shrink-0 w-6">
              {indexNumber}
            </span>
          ) : (
            <div className="w-20 aspect-[4/3] overflow-hidden rounded-xs shrink-0 border border-slate-200">
              <EditorialImage
                src={post.imageUrl}
                alt={post.title}
                category={post.category}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-[15px] font-semibold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {post.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span className="font-medium text-primary">{post.category}</span>
              <span aria-hidden="true">·</span>
              <span>{relativeTime}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (horizontal) {
    return (
      <article className="group flex flex-col sm:flex-row gap-4 py-4 first:pt-0 last:pb-0 border-b border-slate-200 last:border-b-0">
        <Link
          to={`/post/${post.id}`}
          className="sm:w-44 aspect-[4/3] overflow-hidden rounded-xs shrink-0 border border-slate-200"
        >
          <EditorialImage
            src={post.imageUrl}
            alt={post.title}
            category={post.category}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-primary">{post.category}</span>
              <span aria-hidden="true">·</span>
              <span>{relativeTime}</span>
            </div>
            <Link to={`/post/${post.id}`}>
              <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {post.title}
              </h3>
            </Link>
            <p className="text-slate-600 text-sm mt-1.5 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-slate-500">
            <span>{post.author}</span>
            <span className="tabular-nums">{post.views.toLocaleString('bn-BD')} পাঠ</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white border border-slate-200 rounded-sm overflow-hidden group flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        <Link to={`/post/${post.id}`} className="block aspect-[16/10] overflow-hidden border-b border-slate-100">
          <EditorialImage
            src={post.imageUrl}
            alt={post.title}
            category={post.category}
            className="w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
          />
        </Link>
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-1.5 truncate">
              <Link
                to={`/category/${post.category}`}
                className="font-semibold text-primary hover:underline"
              >
                {post.category}
              </Link>
              <span aria-hidden="true">·</span>
              <span>{relativeTime}</span>
            </div>
            {onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => onToggleBookmark(post.id, e)}
                aria-label="সংরক্ষণ করুন"
                className={`p-1 transition-colors ${
                  isBookmarked ? 'text-primary' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          <Link to={`/post/${post.id}`}>
            <h3 className="font-serif text-[19px] font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {post.title}
            </h3>
          </Link>

          <p className="text-slate-600 mt-2 text-sm leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{post.author}</span>
        <span className="tabular-nums">{post.views.toLocaleString('bn-BD')} পাঠ</span>
      </div>
    </article>
  );
};
