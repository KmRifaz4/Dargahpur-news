import { Post, SiteSettings, User, Comment, Category, MenuItem } from '../types';
import { INITIAL_POSTS, INITIAL_SETTINGS, INITIAL_USERS, INITIAL_COMMENTS, DEFAULT_NEWS_IMAGE } from '../constants';

const KEYS = {
  POSTS: 'dargahpur_posts_v3',
  SETTINGS: 'dargahpur_settings_v3',
  USERS: 'dargahpur_users_v3',
  COMMENTS: 'dargahpur_comments_v3',
  CATEGORIES: 'dargahpur_categories_v3',
  SESSIONS: 'dargahpur_session',
  MENU: 'dargahpur_menu_v3',
  BOOKMARKS: 'dargahpur_bookmarks_v3'
};

export const getRelativeTimeBn = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) {
    return `${diffMins.toLocaleString('bn-BD')} মিনিট আগে`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours.toLocaleString('bn-BD')} ঘণ্টা আগে`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'গতকাল';
  if (diffDays < 7) {
    return `${diffDays.toLocaleString('bn-BD')} দিন আগে`;
  }
  return new Date(isoDate).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const storageService = {
  // Posts
  getPosts: (): Post[] => {
    const data = localStorage.getItem(KEYS.POSTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_POSTS;
      }
    }
    localStorage.setItem(KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  },
  getPostById: (id: string): Post | undefined => {
    return storageService.getPosts().find((p) => p.id === id);
  },
  savePost: (post: Post) => {
    const posts = storageService.getPosts();
    const index = posts.findIndex((p) => p.id === post.id);
    const normalized: Post = {
      ...post,
      imageUrl: post.imageUrl || DEFAULT_NEWS_IMAGE
    };
    if (index > -1) posts[index] = normalized;
    else posts.unshift(normalized);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },
  deletePost: (id: string) => {
    const posts = storageService.getPosts().filter((p) => p.id !== id);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },

  // Bookmarks
  getBookmarks: (): string[] => {
    const data = localStorage.getItem(KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  },
  toggleBookmark: (postId: string): string[] => {
    const current = storageService.getBookmarks();
    const updated = current.includes(postId)
      ? current.filter((id) => id !== postId)
      : [...current, postId];
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(updated));
    return updated;
  },

  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    if (data) return JSON.parse(data);
    const initial: Category[] = [
      { id: 'cat-1', name: 'গ্রামের খবর', description: 'দরগাহপুর ও আশেপাশের জনপদের প্রতিদিনের সংবাদ ও উন্নয়ন পরিক্রমা' },
      { id: 'cat-2', name: 'শিক্ষা', description: 'বিদ্যালয়, মাদ্রাসা, মেধা বৃত্তি ও শিক্ষার্থীদের সাফল্যের খবর' },
      { id: 'cat-3', name: 'কৃষি ও অর্থনীতি', description: 'ফসল চাষাবাদ, মৎস্য ঘের, বাজার দর ও গ্রামীণ অর্থনীতির বিশ্লেষণ' },
      { id: 'cat-4', name: 'খেলাধুলা', description: 'গ্রামীণ টুর্নামেন্ট, ক্রিকেট, ফুটবল ও ক্রীড়াঙ্গনের সর্বশেষ খবর' },
      { id: 'cat-5', name: 'ইসলামিক খবর', description: 'মসজিদ, মাহফিল, ধর্মীয় শিক্ষা ও সামাজিক সম্প্রীতির সংবাদ' },
      { id: 'cat-6', name: 'সাহিত্য ও ব্লগ', description: 'মতামত, স্মৃতিচারণ, কবিতা, ইতিহাস ও পাঠকের কলাম' }
    ];
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(initial));
    return initial;
  },
  saveCategory: (category: Category) => {
    const cats = storageService.getCategories();
    const idx = cats.findIndex((c) => c.id === category.id);
    if (idx > -1) cats[idx] = category;
    else cats.push(category);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
  },
  deleteCategory: (id: string) => {
    const cats = storageService.getCategories().filter((c) => c.id !== id);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
  },

  // Menu Items
  getMenuItems: (): MenuItem[] => {
    const data = localStorage.getItem(KEYS.MENU);
    if (data) return JSON.parse(data);

    const initial: MenuItem[] = [
      { id: 'm1', label: 'প্রচ্ছদ', url: '/', order: 0 },
      { id: 'm2', label: 'গ্রামের খবর', url: '/category/গ্রামের খবর', order: 1 },
      { id: 'm3', label: 'শিক্ষা', url: '/category/শিক্ষা', order: 2 },
      { id: 'm4', label: 'কৃষি ও অর্থনীতি', url: '/category/কৃষি ও অর্থনীতি', order: 3 },
      { id: 'm5', label: 'খেলাধুলা', url: '/category/খেলাধুলা', order: 4 }
    ];
    localStorage.setItem(KEYS.MENU, JSON.stringify(initial));
    return initial;
  },
  saveMenuItem: (item: MenuItem) => {
    const items = storageService.getMenuItems();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx > -1) items[idx] = item;
    else items.push(item);
    items.sort((a, b) => a.order - b.order);
    localStorage.setItem(KEYS.MENU, JSON.stringify(items));
  },
  deleteMenuItem: (id: string) => {
    const items = storageService.getMenuItems().filter((i) => i.id !== id);
    localStorage.setItem(KEYS.MENU, JSON.stringify(items));
  },

  // Settings
  getSettings: (): SiteSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  },
  saveSettings: (settings: SiteSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Comments
  getComments: (): Comment[] => {
    const data = localStorage.getItem(KEYS.COMMENTS);
    if (data) return JSON.parse(data);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
    return INITIAL_COMMENTS;
  },
  addComment: (comment: Comment) => {
    const comments = storageService.getComments();
    comments.unshift(comment);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
  },
  updateComment: (comment: Comment) => {
    const comments = storageService.getComments();
    const idx = comments.findIndex((c) => c.id === comment.id);
    if (idx > -1) comments[idx] = comment;
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
  },
  deleteComment: (id: string) => {
    const comments = storageService.getComments().filter((c) => c.id !== id);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
  },

  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUser: (user: User) => {
    const users = storageService.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx > -1) users[idx] = user;
    else users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  deleteUser: (id: string) => {
    const users = storageService.getUsers().filter((u) => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // Session
  setSession: (user: User | null) => {
    if (user) localStorage.setItem(KEYS.SESSIONS, JSON.stringify(user));
    else localStorage.removeItem(KEYS.SESSIONS);
  },
  getSession: (): User | null => {
    const data = localStorage.getItem(KEYS.SESSIONS);
    return data ? JSON.parse(data) : null;
  }
};
