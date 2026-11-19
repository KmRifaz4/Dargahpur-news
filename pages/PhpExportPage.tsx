import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  FileCode2,
  FolderOpen,
  Check,
  Copy,
  Database,
  ShieldCheck,
  Server,
  UploadCloud,
  Image as ImageIcon,
  Lock
} from 'lucide-react';

import configPhp from '../php-site/config.php?raw';
import installDbPhp from '../php-site/install_db.php?raw';
import indexPhp from '../php-site/index.php?raw';
import postPhp from '../php-site/post.php?raw';
import categoryPhp from '../php-site/category.php?raw';
import contactPhp from '../php-site/contact.php?raw';
import pagePhp from '../php-site/page.php?raw';
import headerPhp from '../php-site/includes/header.php?raw';
import footerPhp from '../php-site/includes/footer.php?raw';
import adminIndexPhp from '../php-site/admin/index.php?raw';
import adminLoginPhp from '../php-site/admin/login.php?raw';
import adminLogoutPhp from '../php-site/admin/logout.php?raw';
import databaseSql from '../php-site/database.sql?raw';
import htaccessRaw from '../php-site/.htaccess?raw';
import readmeHostingTxt from '../php-site/README-HOSTING.txt?raw';

import imgSchoolSports from '../src/assets/images/news_school_sports_bd_1794560460123.jpg';
import imgPaddyHarvest from '../src/assets/images/news_paddy_harvest_bd_1794560460641.jpg';
import imgCanalBridge from '../src/assets/images/news_canal_bridge_bd_1794560461483.jpg';
import imgVillageMosque from '../src/assets/images/news_village_mosque_bd_1794560461596.jpg';
import imgCricketMatch from '../src/assets/images/news_cricket_match_bd_1794560463626.jpg';
import imgVillageMarket from '../src/assets/images/news_village_market_bd_1794560478173.jpg';
import imgVillageLibrary from '../src/assets/images/news_village_library_bd_1794560478292.jpg';

interface PhpBundleFile {
  path: string;
  label: string;
  group: 'মূল পাতা' | 'ডাটাবেস ও কনফিগ' | 'অ্যাডমিন প্যানেল' | 'হোস্টিং ও নির্দেশিকা';
  content: string;
}

const UPLOADS_HTACCESS = `# Prevent PHP script execution inside uploads directory
<FilesMatch "\\.(php|phtml|php3|php4|php5|phar)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</FilesMatch>
Options -Indexes
`;

const DATA_HTACCESS = `# Deny direct web access to SQLite database directory
<IfModule mod_authz_core.c>
  Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
  Order allow,deny
  Deny from all
</IfModule>
`;

const PHP_FILES: PhpBundleFile[] = [
  { path: 'index.php', label: 'হোমপেজ ও নিউজ ফিড', group: 'মূল পাতা', content: indexPhp },
  { path: 'post.php', label: 'সংবাদ বিস্তারিত ও মন্তব্য', group: 'মূল পাতা', content: postPhp },
  { path: 'category.php', label: 'বিভাগ ভিত্তিক আর্কাইভ', group: 'মূল পাতা', content: categoryPhp },
  { path: 'contact.php', label: 'সংবাদ প্রেরণ ও যোগাযোগ', group: 'মূল পাতা', content: contactPhp },
  { path: 'page.php', label: 'আমাদের সম্পর্কে ও নীতিমালা', group: 'মূল পাতা', content: pagePhp },
  { path: 'includes/header.php', label: 'হেডার ও মেনু টেমপ্লেট', group: 'মূল পাতা', content: headerPhp },
  { path: 'includes/footer.php', label: 'ফুটার টেমপ্লেট', group: 'মূল পাতা', content: footerPhp },
  { path: 'config.php', label: 'ডাটাবেস কনফিগ (SQLite/MySQL)', group: 'ডাটাবেস ও কনফিগ', content: configPhp },
  { path: 'install_db.php', label: 'অটো টেবিল ও সিড ইনস্টলার', group: 'ডাটাবেস ও কনফিগ', content: installDbPhp },
  { path: 'database.sql', label: 'ঐচ্ছিক MySQL স্কিমা', group: 'ডাটাবেস ও কনফিগ', content: databaseSql },
  { path: 'admin/index.php', label: 'সম্পূর্ণ অ্যাডমিন সিএমএস', group: 'অ্যাডমিন প্যানেল', content: adminIndexPhp },
  { path: 'admin/login.php', label: 'অ্যাডমিন লগইন পেজ', group: 'অ্যাডমিন প্যানেল', content: adminLoginPhp },
  { path: 'admin/logout.php', label: 'অ্যাডমিন লগআউট', group: 'অ্যাডমিন প্যানেল', content: adminLogoutPhp },
  { path: '.htaccess', label: 'অ্যাপাচি নিরাপত্তা রুলস', group: 'হোস্টিং ও নির্দেশিকা', content: htaccessRaw },
  { path: 'uploads/.htaccess', label: 'আপলোড ফোল্ডার নিরাপত্তা', group: 'হোস্টিং ও নির্দেশিকা', content: UPLOADS_HTACCESS },
  { path: 'data/.htaccess', label: 'ডাটাবেস ফোল্ডার নিরাপত্তা', group: 'হোস্টিং ও নির্দেশিকা', content: DATA_HTACCESS },
  { path: 'README-HOSTING.txt', label: 'হোস্টিং আপলোড নির্দেশিকা', group: 'হোস্টিং ও নির্দেশিকা', content: readmeHostingTxt }
];

const NEWS_IMAGES: Array<{ zipPath: string; url: string; title: string }> = [
  { zipPath: 'assets/images/school_sports.jpg', url: imgSchoolSports, title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা' },
  { zipPath: 'assets/images/paddy_harvest.jpg', url: imgPaddyHarvest, title: 'আমন ধান কাটা উৎসব' },
  { zipPath: 'assets/images/canal_bridge.jpg', url: imgCanalBridge, title: 'খালপাড় সেতু সংস্কার' },
  { zipPath: 'assets/images/village_mosque.jpg', url: imgVillageMosque, title: 'মসজিদ ও ইসলামী অনুষ্ঠান' },
  { zipPath: 'assets/images/cricket_match.jpg', url: imgCricketMatch, title: 'যুব ক্রিকেট টুর্নামেন্ট' },
  { zipPath: 'assets/images/village_market.jpg', url: imgVillageMarket, title: 'দরগাহপুর হাটের দৃশ্য' },
  { zipPath: 'assets/images/village_library.jpg', url: imgVillageLibrary, title: 'পাঠাগার ও শিক্ষাবৃত্তি' }
];

export const PhpExportPage: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('config.php');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const activeFile = PHP_FILES.find((f) => f.path === selectedPath) || PHP_FILES[0];

  const handleDownloadZip = async () => {
    setDownloading(true);
    setErrorMsg('');
    setDownloaded(false);

    try {
      const zip = new JSZip();

      PHP_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      await Promise.all(
        NEWS_IMAGES.map(async (img) => {
          const response = await fetch(img.url);
          if (!response.ok) {
            throw new Error(`ছবি লোড করতে সমস্যা হয়েছে: ${img.zipPath}`);
          }
          const blob = await response.blob();
          zip.file(img.zipPath, blob);
        })
      );

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      const downloadUrl = URL.createObjectURL(zipBlob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'dargahpur-sangbad-php.zip';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);

      setDownloaded(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'ZIP ফাইল তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const groupedFiles: Record<PhpBundleFile['group'], PhpBundleFile[]> = {
    'মূল পাতা': PHP_FILES.filter((f) => f.group === 'মূল পাতা'),
    'ডাটাবেস ও কনফিগ': PHP_FILES.filter((f) => f.group === 'ডাটাবেস ও কনফিগ'),
    'অ্যাডমিন প্যানেল': PHP_FILES.filter((f) => f.group === 'অ্যাডমিন প্যানেল'),
    'হোস্টিং ও নির্দেশিকা': PHP_FILES.filter((f) => f.group === 'হোস্টিং ও নির্দেশিকা')
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="border-b-2 border-slate-900 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            cPanel / Shared Hosting Ready · PHP 8.0+
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 leading-tight">
            দরগাহপুর সংবাদ — সম্পূর্ণ PHP ওয়েবসাইট হোস্টিং প্যাক
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            কোনো WordPress বা জটিল বিল্ড প্রক্রিয়া ছাড়াই সরাসরি যেকোনো cPanel শেয়ার্ড হোস্টিংয়ের{' '}
            <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 border border-slate-200 text-slate-900">
              public_html
            </code>{' '}
            ফোল্ডারে আপলোড করেই ওয়েবসাইটটি চালু করতে পারবেন। এতে পূর্ণাঙ্গ নিউজ পোর্টাল, রিয়েল ইমেজ আপলোডসহ অ্যাডমিন প্যানেল, বাজারদর ম্যানেজার এবং অটো-ডাটাবেস (SQLite + ঐচ্ছিক MySQL) যুক্ত আছে।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={downloading}
            className="px-6 py-3.5 bg-primary text-white font-semibold text-sm rounded-sm hover:bg-red-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer"
          >
            <Download size={18} />
            <span>
              {downloading
                ? 'ZIP ফাইল তৈরি হচ্ছে...'
                : downloaded
                ? 'পুনরায় ডাউনলোড করুন (.zip)'
                : 'সম্পূর্ণ PHP সাইট ডাউনলোড করুন (.zip)'}
            </span>
          </button>
        </div>
      </section>

      {downloaded && (
        <div className="border border-emerald-300 bg-emerald-50 text-emerald-950 px-4 py-3 text-sm flex items-center gap-2.5">
          <Check size={16} className="text-emerald-700 shrink-0" />
          <span>
            <strong>dargahpur-sangbad-php.zip</strong> সফলভাবে ডাউনলোড শুরু হয়েছে ({PHP_FILES.length}টি কোড ফাইল ও {NEWS_IMAGES.length}টি আসল সংবাদের ছবিসহ)।
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="border border-red-300 bg-red-50 text-red-900 px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Key Capabilities Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-slate-200 bg-white p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-950 font-semibold text-sm">
            <Database size={16} className="text-primary" />
            <span>জিরো-কনফিগ SQLite + MySQL</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            আপলোড করে ব্রাউজারে ওপেন করলেই অটোমেটিক ডাটাবেস ও ৭টি ডেমো সংবাদ তৈরি হয়ে যাবে। চাইলে MySQL-এও সুইচ করা যাবে।
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-950 font-semibold text-sm">
            <Lock size={16} className="text-primary" />
            <span>সম্পূর্ণ PHP অ্যাডমিন প্যানেল</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            সংবাদ প্রকাশ/সম্পাদনা, সরাসরি ছবি আপলোড, বিভাগ, মন্তব্য অনুমোদন, হাটের বাজারদর ও পাঠকের বার্তা পরিচালনা।
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-950 font-semibold text-sm">
            <ShieldCheck size={16} className="text-primary" />
            <span>সিকিউরিটি হার্ডেনিং</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            PDO Prepared Statements, CSRF টোকেন, password_hash, XSS ফিল্টার এবং .htaccess দিয়ে ডাটাবেস ও আপলোড সুরক্ষা।
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-950 font-semibold text-sm">
            <ImageIcon size={16} className="text-primary" />
            <span>৭টি আসল প্রেস ফটো যুক্ত</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            হোমপেজের সব সংবাদের ছবি <code className="font-mono text-[11px]">assets/images/</code> ফোল্ডারে অপ্টিমাইজড JPG হিসেবে প্যাকেজের সাথেই আছে।
          </p>
        </div>
      </section>

      {/* 3-Step cPanel Upload Instructions + Credentials */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <UploadCloud size={18} className="text-primary" />
            <h2 className="font-serif text-lg font-bold text-slate-950">
              হোস্টিংয়ে (cPanel) আপলোড করার ৩টি সহজ ধাপ
            </h2>
          </div>

          <ol className="space-y-4 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="font-mono font-bold text-xs bg-slate-900 text-white w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                ১
              </span>
              <div>
                <p className="font-semibold text-slate-950">ZIP ফাইল আপলোড ও Extract করুন</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  আপনার হোস্টিংয়ের <strong>cPanel → File Manager → public_html</strong> ফোল্ডারে প্রবেশ করুন। উপরের বাটন থেকে ডাউনলোড করা{' '}
                  <code className="font-mono bg-slate-100 px-1">dargahpur-sangbad-php.zip</code> ফাইলটি Upload করে ডান-ক্লিক করে{' '}
                  <strong>Extract</strong> করুন।
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="font-mono font-bold text-xs bg-slate-900 text-white w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                ২
              </span>
              <div>
                <p className="font-semibold text-slate-950">ওয়েবসাইট ভিজিট করুন (কোনো কনফিগ ছাড়াই চালু)</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  এবার আপনার ডোমেইন (<code className="font-mono bg-slate-100 px-1">https://yourdomain.com</code>) ব্রাউজারে ওপেন করুন। প্রথম ভিজিটেই{' '}
                  <code className="font-mono bg-slate-100 px-1">data/dargahpur.sqlite</code> ডাটাবেস অটোমেটিক তৈরি হয়ে পুরো সাইট লাইভ হয়ে যাবে।
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="font-mono font-bold text-xs bg-slate-900 text-white w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                ৩
              </span>
              <div>
                <p className="font-semibold text-slate-950">অ্যাডমিন প্যানেলে লগইন করে পাসওয়ার্ড পরিবর্তন করুন</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  <code className="font-mono bg-slate-100 px-1">https://yourdomain.com/admin/</code> ঠিকানায় গিয়ে নিচের ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করুন। লগইন করেই <strong>সেটিংস</strong> ট্যাব থেকে পাসওয়ার্ড বদলে নিন।
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="lg:col-span-4 border border-slate-200 bg-slate-50 p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Server size={18} className="text-slate-900" />
              <h2 className="font-serif text-lg font-bold text-slate-950">
                সার্ভার ও লগইন তথ্য
              </h2>
            </div>

            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <dt className="text-slate-600">সার্ভার রিকোয়ারমেন্ট</dt>
                <dd className="font-mono font-semibold text-slate-900">PHP 8.0+ (PDO)</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <dt className="text-slate-600">ডিফল্ট ডাটাবেস</dt>
                <dd className="font-mono font-semibold text-slate-900">SQLite (অটো-সেটআপ)</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <dt className="text-slate-600">অ্যাডমিন URL</dt>
                <dd className="font-mono font-semibold text-primary">/admin/login.php</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <dt className="text-slate-600">ডিফল্ট ইউজারনেম</dt>
                <dd className="font-mono font-semibold text-slate-900">rifaz</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">ডিফল্ট পাসওয়ার্ড</dt>
                <dd className="font-mono font-semibold text-slate-900">rifaz</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-slate-200 pt-4 text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900 block mb-1">MySQL ব্যবহার করতে চাইলে:</strong>
            cPanel phpMyAdmin-এ <code className="font-mono bg-white px-1 border border-slate-200">database.sql</code> ইম্পোর্ট করে{' '}
            <code className="font-mono bg-white px-1 border border-slate-200">config.php</code> ফাইলে{' '}
            <code className="font-mono bg-white px-1 border border-slate-200">DB_DRIVER = &apos;mysql&apos;</code> করে দিন।
          </div>
        </div>
      </section>

      {/* Interactive Source Code Inspector */}
      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="text-primary" />
            <h2 className="font-serif text-lg font-bold text-slate-950">
              প্যাকেজের ফাইলসমূহ ও সোর্স কোড প্রিভিউ ({PHP_FILES.length}টি ফাইল + {NEWS_IMAGES.length}টি ছবি)
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3.5 py-1.5 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 rounded-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
            <span>{copied ? 'কপি হয়েছে' : `${activeFile.path} কপি করুন`}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* File Tree Sidebar */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 space-y-5 max-h-[540px] overflow-y-auto bg-white">
            {(Object.keys(groupedFiles) as Array<PhpBundleFile['group']>).map((groupName) => (
              <div key={groupName} className="space-y-1.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">
                  {groupName}
                </h3>
                <div className="space-y-0.5">
                  {groupedFiles[groupName].map((file) => {
                    const isSelected = file.path === activeFile.path;
                    return (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => setSelectedPath(file.path)}
                        className={`w-full text-left px-2.5 py-2 rounded-sm transition-colors flex items-start gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <FileCode2
                          size={14}
                          className={`mt-0.5 shrink-0 ${
                            isSelected ? 'text-red-400' : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-semibold truncate">
                            {file.path}
                          </div>
                          <div
                            className={`text-[11px] truncate ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {file.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">
                সংযুক্ত ছবিসমূহ (assets/images/)
              </h3>
              <ul className="space-y-1 px-2 text-xs text-slate-600">
                {NEWS_IMAGES.map((img) => (
                  <li key={img.zipPath} className="flex items-center gap-2 py-0.5">
                    <ImageIcon size={12} className="text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">
                      {img.zipPath.replace('assets/images/', '')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-8 bg-slate-950 text-slate-100 flex flex-col max-h-[540px]">
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-200 font-semibold">{activeFile.path}</span>
              <span className="text-slate-400">{activeFile.label}</span>
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-auto flex-1 text-slate-200">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
