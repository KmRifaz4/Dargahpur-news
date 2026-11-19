import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import { CategoryPage } from './pages/CategoryPage';
import { AboutPage, ContactPage, PrivacyPage, TermsPage } from './pages/PublicPages';
import { AdminOverview } from './pages/admin/AdminOverview';
import { PostList, PostEditor } from './pages/admin/PostManager';
import { CategoryManager } from './pages/admin/CategoryManager';
import { CommentManager } from './pages/admin/CommentManager';
import { MenuManager } from './pages/admin/MenuManager';
import { SettingsEditor } from './pages/admin/SettingsEditor';
import { UserManager } from './pages/admin/UserManager';
import { PhpExportPage } from './pages/PhpExportPage';
import { Login } from './pages/Login';
import { storageService } from './services/storageService';

const ProtectedAdmin: React.FC = () => {
  const session = storageService.getSession();
  if (!session) return <Navigate to="/login" replace />;
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC FRONTEND ROUTES */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/post/:id" element={<Layout><PostDetail /></Layout>} />
        <Route path="/category/:name" element={<Layout><CategoryPage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/php-export" element={<Layout><PhpExportPage /></Layout>} />

        {/* AUTHENTICATION */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ADMIN AREA */}
        <Route path="/admin" element={<ProtectedAdmin />}>
          <Route index element={<AdminOverview />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="posts" element={<PostList />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/edit/:id" element={<PostEditor />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="comments" element={<CommentManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="settings" element={<SettingsEditor />} />
          <Route path="php-export" element={<PhpExportPage />} />
        </Route>

        {/* DEFAULT FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
