<?php
$settings = get_settings();
$navCategories = array_slice(get_categories(), 0, 4);
$pageTitle = isset($pageTitle) ? $pageTitle . ' | ' . $settings['site_name'] : $settings['site_name'] . ' — সত্যের পথে, জনপদের কণ্ঠস্বর';
$currentScript = basename($_SERVER['PHP_SELF']);
$activeCat = $_GET['name'] ?? '';
$isAdminLoggedIn = !empty($_SESSION['admin_user']);
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle) ?></title>
    <meta name="description" content="<?= e($settings['tagline'] ?? '') ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Serif+Bengali:wght@600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Hind Siliguri"', 'sans-serif'],
                        serif: ['"Noto Serif Bengali"', 'serif'],
                        mono: ['"JetBrains Mono"', 'monospace'],
                    },
                    colors: {
                        primary: '#b91c1c',
                        secondary: '#065f46',
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; background: #ffffff; color: #0f172a; -webkit-font-smoothing: antialiased; }
        h1, h2, h3 { font-family: 'Noto Serif Bengali', serif; text-wrap: balance; }
        .tabular-nums { font-variant-numeric: tabular-nums; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @media print { header, footer, .no-print { display: none !important; } }
    </style>
</head>
<body class="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-red-700 selection:text-white">

<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 no-print">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <!-- Zone 1: Brand -->
        <a href="index.php" class="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-950 hover:text-primary transition-colors whitespace-nowrap shrink-0">
            <?= e($settings['site_name']) ?>
        </a>

        <!-- Zone 2: 5 Section Links -->
        <nav class="hidden md:flex items-center gap-7 text-[15px] font-medium text-slate-700">
            <a href="index.php" class="py-1 border-b-2 whitespace-nowrap shrink-0 <?= $currentScript === 'index.php' ? 'border-primary text-slate-950 font-semibold' : 'border-transparent hover:text-slate-950 hover:border-slate-400' ?>">
                প্রচ্ছদ
            </a>
            <?php foreach ($navCategories as $cat): ?>
                <a href="category.php?name=<?= urlencode($cat['name']) ?>" class="py-1 border-b-2 whitespace-nowrap shrink-0 <?= ($currentScript === 'category.php' && $activeCat === $cat['name']) ? 'border-primary text-slate-950 font-semibold' : 'border-transparent hover:text-slate-950 hover:border-slate-400' ?>">
                    <?= e($cat['name']) ?>
                </a>
            <?php endforeach; ?>
        </nav>

        <!-- Zone 3: 1 Primary Action + Mobile Drawer Button -->
        <div class="flex items-center gap-3 shrink-0">
            <a href="<?= $isAdminLoggedIn ? 'admin/index.php' : 'contact.php' ?>" class="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-primary rounded-sm hover:bg-red-800 transition-colors whitespace-nowrap shrink-0">
                <?= $isAdminLoggedIn ? 'অ্যাডমিন প্যানেল' : 'সংবাদ পাঠান' ?>
            </a>
            <button type="button" onclick="document.getElementById('mobileDrawer').classList.toggle('hidden')" aria-label="মেনু খুলুন" class="md:hidden p-2 text-slate-700 border border-slate-200 rounded-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>
    </div>
</header>

<!-- Mobile Drawer -->
<div id="mobileDrawer" class="hidden md:hidden fixed inset-0 z-50 no-print">
    <div class="absolute inset-0 bg-slate-950/50" onclick="document.getElementById('mobileDrawer').classList.add('hidden')"></div>
    <div class="absolute top-0 right-0 bottom-0 w-72 bg-white border-l border-slate-200 p-6 flex flex-col justify-between">
        <div>
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <span class="font-serif font-bold text-lg text-slate-950"><?= e($settings['site_name']) ?></span>
                <button type="button" onclick="document.getElementById('mobileDrawer').classList.add('hidden')" class="p-1 text-slate-500">✕</button>
            </div>
            <nav class="space-y-1">
                <a href="index.php" class="block px-3 py-2.5 text-base font-medium border-b border-slate-100 text-slate-800">প্রচ্ছদ</a>
                <?php foreach (get_categories() as $cat): ?>
                    <a href="category.php?name=<?= urlencode($cat['name']) ?>" class="block px-3 py-2.5 text-base font-medium border-b border-slate-100 text-slate-700"><?= e($cat['name']) ?></a>
                <?php endforeach; ?>
                <a href="page.php?slug=about" class="block px-3 py-2.5 text-base font-medium border-b border-slate-100 text-slate-700">আমাদের সম্পর্কে</a>
                <a href="contact.php" class="block px-3 py-2.5 text-base font-medium text-slate-700">সংবাদ ও মতামত পাঠান</a>
            </nav>
        </div>
        <div class="pt-4 border-t border-slate-200">
            <a href="admin/index.php" class="block w-full text-center py-2.5 px-4 border border-slate-300 text-slate-800 font-semibold text-sm">বার্তা কক্ষ ও অ্যাডমিন প্যানেল</a>
        </div>
    </div>
</div>

<main class="flex-1 max-w-[1360px] mx-auto w-full px-4 sm:px-6 py-5 sm:py-8">
