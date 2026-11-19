<?php
require_once __DIR__ . '/config.php';

$pdo = get_db();
$categories = get_categories();
$catName = trim($_GET['name'] ?? '');
$search = trim($_GET['q'] ?? '');
$sort = ($_GET['sort'] ?? 'latest') === 'popular' ? 'popular' : 'latest';

$currentCat = null;
foreach ($categories as $c) {
    if ($c['name'] === $catName) {
        $currentCat = $c;
        break;
    }
}

$where = [];
$params = [];
if ($catName !== '') {
    $where[] = 'category = ?';
    $params[] = $catName;
}
if ($search !== '') {
    $where[] = '(title LIKE ? OR excerpt LIKE ? OR author LIKE ?)';
    $like = '%' . $search . '%';
    array_push($params, $like, $like, $like);
}
$sql = 'SELECT * FROM posts';
if (!empty($where)) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= $sort === 'popular' ? ' ORDER BY views DESC, id DESC' : ' ORDER BY publish_date DESC, id DESC';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$posts = $stmt->fetchAll();

$pageTitle = $catName ?: 'সকল সংবাদ';
require_once __DIR__ . '/includes/header.php';
?>

<div class="space-y-8">
    <header class="bg-slate-50 border border-slate-200 p-6 sm:p-8 space-y-4">
        <div class="text-xs text-slate-500">
            <a href="index.php" class="hover:text-slate-900">প্রচ্ছদ</a> / <span class="font-semibold text-primary"><?= e($catName ?: 'সকল বিভাগ') ?></span>
        </div>
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div class="space-y-1.5 max-w-2xl">
                <h1 class="font-serif text-3xl sm:text-4xl font-bold text-slate-950"><?= e($catName ?: 'সকল সংবাদ') ?></h1>
                <p class="text-sm text-slate-600"><?= e($currentCat['description'] ?? 'দরগাহপুর সংবাদে প্রকাশিত প্রতিবেদনসমূহ।') ?></p>
            </div>
            <div class="text-xs text-slate-500 tabular-nums">মোট প্রতিবেদন: <strong class="text-slate-900"><?= e(bn_num(count($posts))) ?>টি</strong></div>
        </div>
        <div class="pt-4 border-t border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <?php foreach ($categories as $c): ?>
                <a href="category.php?name=<?= urlencode($c['name']) ?>" class="px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap shrink-0 <?= $c['name'] === $catName ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400' ?>"><?= e($c['name']) ?></a>
            <?php endforeach; ?>
        </div>
    </header>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <form method="GET" action="category.php" class="flex gap-2 w-full sm:w-auto">
            <input type="hidden" name="name" value="<?= e($catName) ?>">
            <input type="text" name="q" value="<?= e($search) ?>" placeholder="এই বিভাগে খুঁজুন..." class="w-full sm:w-64 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-xs">
            <button type="submit" class="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm">খুঁজুন</button>
        </form>
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-sm self-start sm:self-auto">
            <a href="category.php?name=<?= urlencode($catName) ?>&q=<?= urlencode($search) ?>&sort=latest" class="px-3 py-1 text-xs font-medium <?= $sort === 'latest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600' ?>">সর্বশেষ</a>
            <a href="category.php?name=<?= urlencode($catName) ?>&q=<?= urlencode($search) ?>&sort=popular" class="px-3 py-1 text-xs font-medium <?= $sort === 'popular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600' ?>">জনপ্রিয়</a>
        </div>
    </div>

    <?php if (!empty($posts)): ?>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ($posts as $post): ?>
        <article class="bg-white border border-slate-200 rounded-sm overflow-hidden group flex flex-col justify-between">
            <div>
                <a href="post.php?id=<?= (int)$post['id'] ?>" class="block aspect-[16/10] overflow-hidden border-b border-slate-100 bg-slate-100">
                    <img src="<?= e($post['image_url']) ?>" alt="<?= e($post['title']) ?>" class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300">
                </a>
                <div class="p-4 sm:p-5">
                    <div class="text-xs text-slate-500 mb-2"><span class="font-semibold text-primary"><?= e($post['category']) ?></span> · <?= e(bn_relative_time($post['publish_date'])) ?></div>
                    <a href="post.php?id=<?= (int)$post['id'] ?>"><h3 class="font-serif text-[19px] font-bold text-slate-900 group-hover:text-primary leading-snug line-clamp-2"><?= e($post['title']) ?></h3></a>
                    <p class="text-slate-600 mt-2 text-sm line-clamp-2"><?= e($post['excerpt']) ?></p>
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
    <div class="bg-slate-50 border border-slate-200 p-12 text-center space-y-3">
        <h2 class="font-serif text-xl font-bold text-slate-900">এই বিভাগে কোনো সংবাদ পাওয়া যায়নি</h2>
        <a href="index.php" class="inline-block px-4 py-2 bg-primary text-white text-xs font-semibold rounded-sm">প্রচ্ছদে ফিরে যান</a>
    </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
