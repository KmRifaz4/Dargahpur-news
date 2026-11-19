<?php
require_once __DIR__ . '/config.php';

$pdo = get_db();
$settings = get_settings();
$categories = get_categories();

$search = trim($_GET['q'] ?? '');
$selectedCategory = trim($_GET['cat'] ?? '');
$sort = ($_GET['sort'] ?? 'latest') === 'popular' ? 'popular' : 'latest';

$latestPosts = $pdo->query('SELECT * FROM posts ORDER BY publish_date DESC, id DESC')->fetchAll();
$popularPosts = $pdo->query('SELECT * FROM posts ORDER BY views DESC, id DESC LIMIT 5')->fetchAll();
$marketRates = $pdo->query('SELECT * FROM market_rates ORDER BY sort_order ASC, id ASC')->fetchAll();

// লিড ও সাব-লিড
$leadPost = null;
foreach ($latestPosts as $p) {
    if ((int)$p['featured'] === 1) {
        $leadPost = $p;
        break;
    }
}
if (!$leadPost && !empty($latestPosts)) {
    $leadPost = $latestPosts[0];
}
$subLeadPosts = [];
if ($leadPost) {
    foreach ($latestPosts as $p) {
        if ($p['id'] !== $leadPost['id']) {
            $subLeadPosts[] = $p;
            if (count($subLeadPosts) === 3) break;
        }
    }
}

// ফিল্টার্ড সংবাদ তালিকা
$where = [];
$params = [];
if ($selectedCategory !== '') {
    $where[] = 'category = ?';
    $params[] = $selectedCategory;
}
if ($search !== '') {
    $where[] = '(title LIKE ? OR excerpt LIKE ? OR author LIKE ? OR category LIKE ?)';
    $like = '%' . $search . '%';
    array_push($params, $like, $like, $like, $like);
}
$sql = 'SELECT * FROM posts';
if (!empty($where)) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= $sort === 'popular' ? ' ORDER BY views DESC, id DESC' : ' ORDER BY publish_date DESC, id DESC';
$stmtFiltered = $pdo->prepare($sql);
$stmtFiltered->execute($params);
$filteredPosts = $stmtFiltered->fetchAll();

$isDefaultView = ($search === '' && $selectedCategory === '');
$bulletinPosts = array_slice($latestPosts, 0, 4);

require_once __DIR__ . '/includes/header.php';
?>

<div class="space-y-8">
    <!-- Date, Search & Breaking News Bar -->
    <section class="space-y-3 border-b border-slate-200 pb-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-600">
            <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold text-slate-900"><?= e(bn_date('now', true)) ?></span>
                <span aria-hidden="true">·</span>
                <span>দরগাহপুর, আশাশুনি, সাতক্ষীরা</span>
                <span aria-hidden="true">·</span>
                <span>অনলাইন সংস্করণ</span>
            </div>

            <form method="GET" action="index.php" class="flex items-center gap-2 w-full sm:w-auto">
                <?php if ($selectedCategory !== ''): ?>
                    <input type="hidden" name="cat" value="<?= e($selectedCategory) ?>">
                <?php endif; ?>
                <div class="relative flex-1 sm:w-64">
                    <input type="text" name="q" value="<?= e($search) ?>" placeholder="সংবাদ খুঁজুন..." class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-sm text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400">
                </div>
                <button type="submit" class="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm hover:bg-primary transition-colors">খুঁজুন</button>
                <?php if ($search !== '' || $selectedCategory !== ''): ?>
                    <a href="index.php" class="px-2.5 py-1.5 border border-slate-200 text-xs text-slate-600 hover:text-slate-900 rounded-sm">রিসেট</a>
                <?php endif; ?>
            </form>
        </div>

        <?php if (($settings['breaking_enabled'] ?? '1') === '1' && !empty($latestPosts)): ?>
        <div class="border border-slate-200 bg-slate-50 flex items-center justify-between overflow-hidden">
            <div class="flex items-center min-w-0 flex-1">
                <span class="bg-primary text-white text-xs font-bold px-3.5 py-2 whitespace-nowrap shrink-0">সদ্যপ্রাপ্ত</span>
                <a id="tickerLink" href="post.php?id=<?= (int)$latestPosts[0]['id'] ?>" class="px-4 py-2 text-sm font-medium text-slate-900 hover:text-primary transition-colors truncate flex-1">
                    <?= e($latestPosts[0]['title']) ?>
                </a>
                <span id="tickerTime" class="hidden sm:inline text-xs text-slate-500 pr-3 whitespace-nowrap shrink-0">
                    <?= e(bn_relative_time($latestPosts[0]['publish_date'])) ?>
                </span>
            </div>
            <div class="flex items-center border-l border-slate-200 shrink-0 bg-white">
                <button type="button" onclick="prevTicker()" aria-label="পূর্ববর্তী" class="px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-100">‹</button>
                <button type="button" onclick="nextTicker()" aria-label="পরবর্তী" class="px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-100 border-l border-slate-200">›</button>
            </div>
        </div>
        <?php endif; ?>
    </section>

    <?php if ($isDefaultView && $leadPost): ?>
    <!-- Front Page 3-Column Newspaper Grid -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-slate-200 pb-10">
        <!-- Lead Story + 3 Sub-Leads -->
        <div class="lg:col-span-8 space-y-6 lg:border-r lg:border-slate-200 lg:pr-8">
            <article class="group grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div class="md:col-span-7 order-2 md:order-1 space-y-3">
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                        <a href="category.php?name=<?= urlencode($leadPost['category']) ?>" class="font-bold text-primary hover:underline"><?= e($leadPost['category']) ?></a>
                        <span aria-hidden="true">·</span>
                        <span><?= e(bn_relative_time($leadPost['publish_date'])) ?></span>
                        <?php if (!empty($leadPost['location'])): ?>
                            <span aria-hidden="true">·</span>
                            <span><?= e($leadPost['location']) ?></span>
                        <?php endif; ?>
                    </div>

                    <a href="post.php?id=<?= (int)$leadPost['id'] ?>">
                        <h1 class="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-slate-950 group-hover:text-primary transition-colors leading-[1.24]">
                            <?= e($leadPost['title']) ?>
                        </h1>
                    </a>

                    <?php if (!empty($leadPost['subtitle'])): ?>
                        <p class="text-base font-medium text-slate-700 leading-snug"><?= e($leadPost['subtitle']) ?></p>
                    <?php endif; ?>

                    <p class="text-sm text-slate-600 leading-relaxed line-clamp-3"><?= e($leadPost['excerpt']) ?></p>

                    <div class="pt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>প্রতিবেদক: <?= e($leadPost['author']) ?></span>
                        <a href="post.php?id=<?= (int)$leadPost['id'] ?>" class="font-semibold text-primary hover:underline">বিস্তারিত →</a>
                    </div>
                </div>

                <a href="post.php?id=<?= (int)$leadPost['id'] ?>" class="md:col-span-5 order-1 md:order-2 aspect-[4/3] overflow-hidden border border-slate-200 block bg-slate-100">
                    <img src="<?= e($leadPost['image_url']) ?>" alt="<?= e($leadPost['title']) ?>" class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300">
                </a>
            </article>

            <!-- 3 Sub-Leads -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
                <?php foreach ($subLeadPosts as $sp): ?>
                <article class="group flex flex-col justify-between space-y-2.5">
                    <div>
                        <a href="post.php?id=<?= (int)$sp['id'] ?>" class="block aspect-[16/10] overflow-hidden border border-slate-200 mb-3 bg-slate-100">
                            <img src="<?= e($sp['image_url']) ?>" alt="<?= e($sp['title']) ?>" class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300">
                        </a>
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                            <a href="category.php?name=<?= urlencode($sp['category']) ?>" class="font-semibold text-primary hover:underline"><?= e($sp['category']) ?></a>
                            <span aria-hidden="true">·</span>
                            <span><?= e(bn_relative_time($sp['publish_date'])) ?></span>
                        </div>
                        <a href="post.php?id=<?= (int)$sp['id'] ?>">
                            <h2 class="font-serif text-[17px] font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2"><?= e($sp['title']) ?></h2>
                        </a>
                    </div>
                    <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed"><?= e($sp['excerpt']) ?></p>
                </article>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Right Sidebar: Latest / Popular Tabs + Market Rates -->
        <aside class="lg:col-span-4 space-y-6">
            <div class="border border-slate-200 bg-white">
                <div class="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
                    <button type="button" id="tabLatestBtn" onclick="switchRail('latest')" class="py-2.5 text-sm font-bold border-b-2 border-primary text-primary bg-white">সর্বশেষ</button>
                    <button type="button" id="tabPopularBtn" onclick="switchRail('popular')" class="py-2.5 text-sm font-bold border-b-2 border-transparent text-slate-600 hover:text-slate-900">সর্বাধিক পঠিত</button>
                </div>

                <div id="railLatest" class="p-4 divide-y divide-slate-200">
                    <?php foreach (array_slice($latestPosts, 0, 5) as $lp): ?>
                    <article class="py-3 first:pt-0 last:pb-0 group">
                        <a href="post.php?id=<?= (int)$lp['id'] ?>" class="flex items-start gap-3">
                            <div class="w-20 aspect-[4/3] overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                <img src="<?= e($lp['image_url']) ?>" alt="<?= e($lp['title']) ?>" class="w-full h-full object-cover">
                            </div>
                            <div class="min-w-0 flex-1">
                                <h4 class="font-serif text-[15px] font-semibold text-slate-900 group-hover:text-primary leading-snug line-clamp-2"><?= e($lp['title']) ?></h4>
                                <div class="text-xs text-slate-500 mt-1">
                                    <span class="font-medium text-primary"><?= e($lp['category']) ?></span> · <?= e(bn_relative_time($lp['publish_date'])) ?>
                                </div>
                            </div>
                        </a>
                    </article>
                    <?php endforeach; ?>
                </div>

                <div id="railPopular" class="hidden p-4 divide-y divide-slate-200">
                    <?php foreach ($popularPosts as $i => $pp): ?>
                    <article class="py-3 first:pt-0 last:pb-0 group">
                        <a href="post.php?id=<?= (int)$pp['id'] ?>" class="flex items-start gap-3">
                            <span class="font-mono text-sm font-semibold text-slate-400 tabular-nums pt-0.5 shrink-0 w-6"><?= e(bn_num($i + 1)) ?>.</span>
                            <div class="min-w-0 flex-1">
                                <h4 class="font-serif text-[15px] font-semibold text-slate-900 group-hover:text-primary leading-snug line-clamp-2"><?= e($pp['title']) ?></h4>
                                <div class="text-xs text-slate-500 mt-1">
                                    <span class="font-medium text-primary"><?= e($pp['category']) ?></span> · <?= e(bn_num($pp['views'])) ?> পাঠ
                                </div>
                            </div>
                        </a>
                    </article>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Dynamic Market Rates -->
            <div class="border border-slate-200 bg-slate-50/70 p-4">
                <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
                    <h3 class="font-serif text-base font-bold text-slate-900">দরগাহপুর হাটের আজকের দর</h3>
                    <span class="text-xs text-slate-500">প্রতি কেজি</span>
                </div>
                <dl class="divide-y divide-slate-200/80 text-xs">
                    <?php foreach ($marketRates as $rate): ?>
                    <div class="py-2 flex justify-between gap-2">
                        <dt class="text-slate-700"><?= e($rate['item_name']) ?></dt>
                        <dd class="font-mono font-semibold text-slate-900 tabular-nums"><?= e($rate['price_range']) ?></dd>
                    </div>
                    <?php endforeach; ?>
                </dl>
            </div>
        </aside>
    </section>

    <!-- Broadcast Bulletin & Audio Summary Desk -->
    <?php if (!empty($bulletinPosts)): ?>
    <section class="bg-slate-950 text-white p-6 sm:p-8 border-t-4 border-primary">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-6 border-b border-slate-800">
            <div>
                <h2 class="font-serif text-2xl font-bold text-white">সংবাদ বুলেটিন ও অডিও সারসংক্ষেপ</h2>
                <p class="text-xs text-slate-400 mt-0.5">দিনের গুরুত্বপূর্ণ প্রতিবেদনগুলো এক নজরে শুনুন অথবা পড়ুন</p>
            </div>
            <a id="bulletinFullLink" href="post.php?id=<?= (int)$bulletinPosts[0]['id'] ?>" class="text-xs font-semibold text-red-400 hover:text-red-300">পূর্ণাঙ্গ প্রতিবেদন পড়ুন →</a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div class="lg:col-span-7 border border-slate-800 bg-slate-900 flex flex-col justify-between overflow-hidden">
                <div class="aspect-[16/9] relative overflow-hidden">
                    <img id="bulletinImg" src="<?= e($bulletinPosts[0]['image_url']) ?>" alt="<?= e($bulletinPosts[0]['title']) ?>" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-5 sm:p-6 space-y-2">
                        <div class="text-xs text-slate-300">
                            <span id="bulletinCat" class="font-semibold text-red-400"><?= e($bulletinPosts[0]['category']) ?></span> ·
                            <span id="bulletinTime"><?= e(bn_relative_time($bulletinPosts[0]['publish_date'])) ?></span>
                        </div>
                        <a id="bulletinTitleLink" href="post.php?id=<?= (int)$bulletinPosts[0]['id'] ?>">
                            <h3 id="bulletinTitle" class="font-serif text-xl sm:text-2xl font-bold text-white hover:text-red-300 leading-snug"><?= e($bulletinPosts[0]['title']) ?></h3>
                        </a>
                    </div>
                </div>
                <div class="p-4 sm:px-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <p id="bulletinExcerpt" class="text-xs text-slate-300 line-clamp-1 flex-1 min-w-[200px]"><?= e($bulletinPosts[0]['excerpt']) ?></p>
                    <button type="button" id="audioBtn" onclick="toggleBulletinAudio()" class="px-3.5 py-1.5 bg-primary hover:bg-red-800 text-white text-xs font-semibold rounded-sm whitespace-nowrap">সংবাদ বুলেটিন শুনুন</button>
                </div>
            </div>

            <div class="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-800 border border-slate-800 bg-slate-900/60">
                <?php foreach ($bulletinPosts as $idx => $bp): ?>
                <button type="button" onclick="selectBulletin(<?= $idx ?>)" class="bulletin-item p-4 text-left flex items-center gap-3.5 hover:bg-slate-800/80 transition-colors <?= $idx === 0 ? 'bg-slate-800/90' : '' ?>">
                    <div class="w-24 aspect-[16/10] overflow-hidden shrink-0 border border-slate-700 bg-slate-800">
                        <img src="<?= e($bp['image_url']) ?>" alt="<?= e($bp['title']) ?>" class="w-full h-full object-cover">
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="text-[11px] text-slate-400 mb-1"><?= e($bp['category']) ?> · <?= e(bn_relative_time($bp['publish_date'])) ?></div>
                        <h4 class="font-serif text-sm font-semibold text-white line-clamp-2 leading-snug"><?= e($bp['title']) ?></h4>
                    </div>
                </button>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>
    <?php endif; ?>

    <!-- Category Filterable Archive & Civic Directory -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        <div class="lg:col-span-8 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-900">
                <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
                    <a href="index.php?sort=<?= e($sort) ?>" class="px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap shrink-0 <?= $selectedCategory === '' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200' ?>">সকল সংবাদ</a>
                    <?php foreach ($categories as $cat): ?>
                        <a href="index.php?cat=<?= urlencode($cat['name']) ?>&sort=<?= e($sort) ?>" class="px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap shrink-0 <?= $selectedCategory === $cat['name'] ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200' ?>"><?= e($cat['name']) ?></a>
                    <?php endforeach; ?>
                </div>
                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-sm shrink-0">
                    <a href="index.php?cat=<?= urlencode($selectedCategory) ?>&q=<?= urlencode($search) ?>&sort=latest" class="px-3 py-1 text-xs font-medium <?= $sort === 'latest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600' ?>">সর্বশেষ</a>
                    <a href="index.php?cat=<?= urlencode($selectedCategory) ?>&q=<?= urlencode($search) ?>&sort=popular" class="px-3 py-1 text-xs font-medium <?= $sort === 'popular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600' ?>">জনপ্রিয়</a>
                </div>
            </div>

            <?php if (!empty($filteredPosts)): ?>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <?php foreach ($filteredPosts as $post): ?>
                <article class="bg-white border border-slate-200 rounded-sm overflow-hidden group flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div>
                        <a href="post.php?id=<?= (int)$post['id'] ?>" class="block aspect-[16/10] overflow-hidden border-b border-slate-100 bg-slate-100">
                            <img src="<?= e($post['image_url']) ?>" alt="<?= e($post['title']) ?>" class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300">
                        </a>
                        <div class="p-4 sm:p-5">
                            <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                <a href="category.php?name=<?= urlencode($post['category']) ?>" class="font-semibold text-primary hover:underline"><?= e($post['category']) ?></a>
                                <span aria-hidden="true">·</span>
                                <span><?= e(bn_relative_time($post['publish_date'])) ?></span>
                            </div>
                            <a href="post.php?id=<?= (int)$post['id'] ?>">
                                <h3 class="font-serif text-[19px] font-bold text-slate-900 group-hover:text-primary leading-snug line-clamp-2"><?= e($post['title']) ?></h3>
                            </a>
                            <p class="text-slate-600 mt-2 text-sm leading-relaxed line-clamp-2"><?= e($post['excerpt']) ?></p>
                        </div>
                    </div>
                    <div class="px-4 sm:px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span><?= e($post['author']) ?></span>
                        <span class="tabular-nums"><?= e(bn_num($post['views'])) ?> পাঠ</span>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="bg-slate-50 border border-slate-200 p-10 text-center space-y-3">
                <p class="font-serif text-lg font-semibold text-slate-800">কোনো সংবাদ পাওয়া যায়নি</p>
                <a href="index.php" class="inline-block px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm">সকল সংবাদ দেখুন</a>
            </div>
            <?php endif; ?>
        </div>

        <aside class="lg:col-span-4 space-y-6">
            <section class="border border-slate-200 bg-white p-5">
                <div class="pb-3 mb-3 border-b border-slate-200">
                    <h3 class="font-serif text-lg font-bold text-slate-900">দরগাহপুর জরুরি সেবা ও তথ্য</h3>
                    <p class="text-xs text-slate-500 mt-0.5">ইউনিয়ন স্বাস্থ্য, কৃষি ও জরুরি যোগাযোগ নম্বর</p>
                </div>
                <dl class="divide-y divide-slate-200/80 text-xs">
                    <div class="py-2.5 flex justify-between gap-2"><dt class="text-slate-600">ইউনিয়ন পরিষদ অফিস</dt><dd class="font-medium text-slate-900 tabular-nums">সকাল ৯:০০ – বিকাল ৫:০০</dd></div>
                    <div class="py-2.5 flex justify-between gap-2"><dt class="text-slate-600">স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র</dt><dd class="font-mono font-medium text-slate-900 tabular-nums">+৮৮০ ১৭১১-২২৩৩৪৪</dd></div>
                    <div class="py-2.5 flex justify-between gap-2"><dt class="text-slate-600">কৃষি পরামর্শ কল সেন্টার</dt><dd class="font-mono font-medium text-slate-900 tabular-nums">১৬১২৩</dd></div>
                    <div class="py-2.5 flex justify-between gap-2"><dt class="text-slate-600">পল্লী বিদ্যুৎ অভিযোগ কেন্দ্র</dt><dd class="font-mono font-medium text-slate-900 tabular-nums">+৮৮০ ১৭৬৯-৪০৫০৬০</dd></div>
                    <div class="py-2.5 flex justify-between gap-2"><dt class="text-slate-600">জামাতের সময় (ফজর / মাগরিব)</dt><dd class="font-medium text-slate-900 tabular-nums">ভোর ৫:০৫ · সন্ধ্যা ৫:৩৮</dd></div>
                </dl>
            </section>

            <section class="border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div class="text-xs font-bold text-primary uppercase tracking-wider">নাগরিক সংবাদদাতা</div>
                <h3 class="font-serif text-lg font-bold text-slate-900 leading-snug">আপনার এলাকার খবর ও ছবি পাঠান</h3>
                <p class="text-xs text-slate-600 leading-relaxed">দরগাহপুর ও আশাশুনির যেকোনো জনগুরুত্বপূর্ণ সমস্যা, উন্নয়ন কিংবা আয়োজনের সংবাদ আমাদের বার্তা কক্ষে পাঠাতে পারেন।</p>
                <a href="contact.php" class="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-sm hover:bg-primary transition-colors">সংবাদ প্রেরণ ফর্ম →</a>
            </section>
        </aside>
    </div>
</div>

<script>
const tickerItems = <?= json_encode(array_map(function($p) {
    return ['id' => (int)$p['id'], 'title' => $p['title'], 'time' => bn_relative_time($p['publish_date'])];
}, array_slice($latestPosts, 0, 6)), JSON_UNESCAPED_UNICODE) ?>;

let tickerIdx = 0;
function renderTicker() {
    if (!tickerItems.length) return;
    const item = tickerItems[tickerIdx];
    const link = document.getElementById('tickerLink');
    const tm = document.getElementById('tickerTime');
    if (link) { link.href = 'post.php?id=' + item.id; link.textContent = item.title; }
    if (tm) { tm.textContent = item.time; }
}
function nextTicker() { tickerIdx = (tickerIdx + 1) % tickerItems.length; renderTicker(); }
function prevTicker() { tickerIdx = (tickerIdx - 1 + tickerItems.length) % tickerItems.length; renderTicker(); }
if (tickerItems.length > 1) setInterval(nextTicker, 5000);

function switchRail(tab) {
    const latest = document.getElementById('railLatest');
    const pop = document.getElementById('railPopular');
    const bLatest = document.getElementById('tabLatestBtn');
    const bPop = document.getElementById('tabPopularBtn');
    if (tab === 'latest') {
        latest.classList.remove('hidden'); pop.classList.add('hidden');
        bLatest.className = 'py-2.5 text-sm font-bold border-b-2 border-primary text-primary bg-white';
        bPop.className = 'py-2.5 text-sm font-bold border-b-2 border-transparent text-slate-600 hover:text-slate-900';
    } else {
        pop.classList.remove('hidden'); latest.classList.add('hidden');
        bPop.className = 'py-2.5 text-sm font-bold border-b-2 border-primary text-primary bg-white';
        bLatest.className = 'py-2.5 text-sm font-bold border-b-2 border-transparent text-slate-600 hover:text-slate-900';
    }
}

const bulletinData = <?= json_encode(array_map(function($p) {
    return [
        'id' => (int)$p['id'],
        'title' => $p['title'],
        'excerpt' => $p['excerpt'],
        'category' => $p['category'],
        'image' => $p['image_url'],
        'time' => bn_relative_time($p['publish_date'])
    ];
}, $bulletinPosts), JSON_UNESCAPED_UNICODE) ?>;

let activeBulletin = 0;
let speaking = false;
function selectBulletin(idx) {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speaking = false;
    const btn = document.getElementById('audioBtn');
    if (btn) btn.textContent = 'সংবাদ বুলেটিন শুনুন';
    activeBulletin = idx;
    const item = bulletinData[idx];
    if (!item) return;
    document.getElementById('bulletinImg').src = item.image;
    document.getElementById('bulletinCat').textContent = item.category;
    document.getElementById('bulletinTime').textContent = item.time;
    document.getElementById('bulletinTitle').textContent = item.title;
    document.getElementById('bulletinExcerpt').textContent = item.excerpt;
    document.getElementById('bulletinTitleLink').href = 'post.php?id=' + item.id;
    document.getElementById('bulletinFullLink').href = 'post.php?id=' + item.id;
    document.querySelectorAll('.bulletin-item').forEach((el, i) => {
        el.classList.toggle('bg-slate-800/90', i === idx);
    });
}
function toggleBulletinAudio() {
    if (!('speechSynthesis' in window)) return;
    const btn = document.getElementById('audioBtn');
    if (speaking) {
        window.speechSynthesis.cancel();
        speaking = false;
        btn.textContent = 'সংবাদ বুলেটিন শুনুন';
        return;
    }
    const item = bulletinData[activeBulletin];
    if (!item) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(item.title + '। ' + item.excerpt);
    u.lang = 'bn-BD'; u.rate = 0.95;
    u.onend = () => { speaking = false; btn.textContent = 'সংবাদ বুলেটিন শুনুন'; };
    speaking = true;
    btn.textContent = 'শোনা বন্ধ করুন';
    window.speechSynthesis.speak(u);
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
