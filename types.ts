export interface Post {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole?: string;
  publishDate: string;
  imageUrl: string;
  imageCaption?: string;
  pullQuote?: string;
  location?: string;
  readTime?: string;
  featured: boolean;
  views: number;
  tags: string[];
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  date: string;
  approved: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  editorName?: string;
  logoUrl: string;
  breakingNewsEnabled: boolean;
  footerText: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    youtube: string;
  };
}

export interface User {
  id: string;
  username: string;
  fullName?: string;
  role: 'Admin' | 'Editor';
  status: 'Active' | 'Blocked';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const DEFAULT_CATEGORIES: string[] = [
  'গ্রামের খবর',
  'শিক্ষা',
  'কৃষি ও অর্থনীতি',
  'খেলাধুলা',
  'ইসলামিক খবর',
  'সাহিত্য ও ব্লগ'
];
