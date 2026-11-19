<?php
require_once __DIR__ . '/config.php';

$pdo = get_db();
$id = (int)($_GET['id'] ?? 0);

$stmt = $pdo->prepare('SELECT * FROM posts WHERE id = ?');
$stmt->execute([$id]);
$post = $stmt->fetch();

if (!$post) {
    http_response_code(404);
    $pageTitle = 'সংবাদ পাওয়া যায়নি';
    require_once __DIR__ . '/includes/header.php';
    echo '<div class="bg-slate-50 border border-slate-200 p-12 text-center max-w-xl mx-auto my-10 space-y-4">
            <h1 class="font-serif text-2xl font-bold text-slate-900">সংবাদটি খুঁজে পাওয়া যায়নি</h1>
            <a href="index.php" class="inline-block px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-sm">প্রচ্ছদে ফিরে যান</a>
          </div>';
    require_once __DIR__ . '/includes/footer.php';
    exit;
}

// পাঠ সংখ্যা বৃদ্ধি
$pdo->prepare('UPDATE posts SET views = views + 1 WHERE id = ?')->execute([$id]);
$post['views'] = (int)$post['views'] + 1;

// মন্তব্য জমা প্রক্রিয়া
$commentSaved = false;
$commentError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_comment'])) {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        $commentError = 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
    } else {
        $cAuthor = trim($_POST['author'] ?? '');
        $cEmail = trim($_POST['email'] ?? '');
        $cContent = trim($_POST['content'] ?? '');
        if ($cAuthor !== '' && $cContent !== '') {
            $pdo->prepare('INSERT INTO comments (post_id, author, email, content, approved, created_at) VALUES (?, ?, ?, ?, 0, ?)')
                ->execute([$id, $cAuthor, $cEmail, $cContent, date('Y-m-d H:i:s')]);
            $commentSaved = true;
        } else {
            $commentError = 'অনুগ্রহ করে নাম এবং মন্তব্য লিখুন।';
        }
    }
}

$commentsStmt = $pdo->prepare('SELECT * FROM comments WHERE post_id = ? AND approved = 1 ORDER BY id DESC');
$commentsStmt->execute([$id]);
$comments = $commentsStmt->fetchAll();

$latestStmt = $pdo->prepare('SELECT * FROM posts WHERE id != ? ORDER BY publish_date DESC LIMIT 4');
$latestStmt->execute([$id]);
$latestPosts = $latestStmt->fetchAll();

$relatedStmt = $pdo->prepare('SELECT * FROM posts WHERE id != ? AND category = ? ORDER BY publish_date DESC LIMIT 4');
$relatedStmt->execute([$id, $post['category']]);
$relatedPosts = $relatedStmt->fetchAll();

$pageTitle = $post['title'];
require_once __DIR__ . '/includes/header.php';
$paragraphs = array_values(array_filter(array_map('trim', explode("\n", $post['content']))));
$tags = array_filter(array_map('trim', explode(',', (string)$post['tags'])));
?>

<div class="space-y-10">
    <nav class="text-xs text-slate-500 flex items-center gap-2 border-b border-slate-200 pb-3 no-print">
        <a href="index.php" class="hover:text-slate-900">প্রচ্ছদ</a>
        <span>/</span>
        <a href="category.php?name=<?= urlencode($post['category']) ?>" class="font-semibold text-primary hover:underline"><?= e($post['category']) ?></a>
        <span>/</span>
        <span class="text-slate-600 truncate max-w-md"><?= e($post['title']) ?></span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article class="lg:col-span-8 bg-white lg:border-r lg:border-slate-200 lg:pr-8">
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                <a href="category.php?name=<?= urlencode($post['category']) ?>" class="font-bold text-primary hover:underline"><?= e($post['category']) ?></a>
                <span>·</span>
                <span>প্রকাশ: <?= e(bn_date($post['publish_date'], true)) ?> (<?= e(bn_relative_time($post['publish_date'])) ?>)</span>
                <span>·</span>
                <span class="tabular-nums"><?= e(bn_num($post['views'])) ?> পাঠ</span>
            </div>

            <h1 class="font-serif text-2xl sm:text-4xl font-bold text-slate-950 leading-[1.24] mb-3"><?= e($post['title']) ?></h1>

            <?php if (!empty($post['subtitle'])): ?>
                <p class="text-base sm:text-lg text-slate-600 font-medium leading-snug mb-5"><?= e($post['subtitle']) ?></p>
            <?php endif; ?>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 mb-6 border-y border-slate-200 text-xs">
                <div>
                    <span class="font-semibold text-slate-900 text-sm"><?= e($post['author']) ?></span>
                    <?php if (!empty($post['author_role'])): ?>
                        <span class="text-slate-500"> · <?= e($post['author_role']) ?></span>
                    <?php endif; ?>
                    <?php if (!empty($post['location'])): ?>
                        <span class="text-slate-500"> · <?= e($post['location']) ?></span>
                    <?php endif; ?>
                </div>
                <div class="flex items-center gap-2 no-print">
                    <div class="flex items-center bg-slate-100 rounded-sm p-0.5 border border-slate-200">
                        <button type="button" onclick="setArticleSize('17px')" class="px-2 py-1 text-xs font-medium hover:bg-white">অ</button>
                        <button type="button" onclick="setArticleSize('19px')" class="px-2 py-1 text-xs font-medium hover:bg-white">অ+</button>
                        <button type="button" onclick="setArticleSize('22px')" class="px-2 py-1 text-xs font-medium hover:bg-white">অ++</button>
                    </div>
                    <button type="button" id="copyBtn" onclick="copyArticleUrl()" class="px-3 py-1.5 border border-slate-200 bg-white text-slate-700 hover:border-slate-400 text-xs font-medium">শেয়ার</button>
                    <button type="button" onclick="window.print()" class="px-3 py-1.5 border border-slate-200 bg-white text-slate-700 hover:border-slate-400 text-xs font-medium">প্রিন্ট</button>
                </div>
            </div>

            <div class="mb-8">
                <div class="aspect-[16/9] overflow-hidden border border-slate-200 bg-slate-100">
                    <img src="<?= e($post['image_url']) ?>" alt="<?= e($post['title']) ?>" class="w-full h-full object-cover">
                </div>
                <p class="text-xs text-slate-500 mt-2"><?= e($post['image_caption'] ?: $post['title'] . ' — ছবি: দরগাহপুর সংবাদ') ?></p>
            </div>

            <div id="articleProse" class="max-w-2xl text-slate-800 space-y-5 leading-[1.85]" style="font-size:17px;">
                <?php foreach ($paragraphs as $idx => $para): ?>
                    <p class="<?= $idx === 0 ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary' : '' ?>">
                        <?= e($para) ?>
                    </p>
                    <?php if ($idx === 1 && !empty($post['pull_quote'])): ?>
                        <blockquote class="my-6 py-5 border-y border-slate-200 font-serif text-xl italic text-slate-900 leading-snug">
                            “<?= e($post['pull_quote']) ?>”
                        </blockquote>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>

            <?php if (!empty($tags)): ?>
            <div class="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span class="font-semibold text-slate-700">বিষয়:</span>
                <?= e(implode(' · ', $tags)) ?>
            </div>
            <?php endif; ?>
        </article>

        <aside class="lg:col-span-4 space-y-8 no-print">
            <section class="border border-slate-200 bg-white p-5">
                <h3 class="font-serif text-lg font-bold text-slate-900 pb-3 mb-4 border-b border-slate-200">সর্বশেষ সংবাদ</h3>
                <div class="divide-y divide-slate-200">
                    <?php foreach ($latestPosts as $lp): ?>
                    <article class="py-3 first:pt-0 last:pb-0 group">
                        <a href="post.php?id=<?= (int)$lp['id'] ?>" class="flex items-start gap-3">
                            <div class="w-20 aspect-[4/3] overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                <img src="<?= e($lp['image_url']) ?>" alt="<?= e($lp['title']) ?>" class="w-full h-full object-cover">
                            </div>
                            <div class="min-w-0 flex-1">
                                <h4 class="font-serif text-[15px] font-semibold text-slate-900 group-hover:text-primary leading-snug line-clamp-2"><?= e($lp['title']) ?></h4>
                                <div class="text-xs text-slate-500 mt-1"><?= e(bn_relative_time($lp['publish_date'])) ?></div>
                            </div>
                        </a>
                    </article>
                    <?php endforeach; ?>
                </div>
            </section>

            <?php if (!empty($relatedPosts)): ?>
            <section class="border border-slate-200 bg-slate-50 p-5">
                <h3 class="font-serif text-lg font-bold text-slate-900 pb-3 mb-4 border-b border-slate-200">এ সম্পর্কিত আরও খবর</h3>
                <div class="divide-y divide-slate-200">
                    <?php foreach ($relatedPosts as $i => $rp): ?>
                    <article class="py-3 first:pt-0 last:pb-0 group">
                        <a href="post.php?id=<?= (int)$rp['id'] ?>" class="flex items-start gap-3">
                            <span class="font-mono text-sm font-semibold text-slate-400 w-5 shrink-0"><?= e(bn_num($i + 1)) ?>.</span>
                            <div class="min-w-0 flex-1">
                                <h4 class="font-serif text-[15px] font-semibold text-slate-900 group-hover:text-primary leading-snug line-clamp-2"><?= e($rp['title']) ?></h4>
                                <div class="text-xs text-slate-500 mt-1"><?= e(bn_relative_time($rp['publish_date'])) ?></div>
                            </div>
                        </a>
                    </article>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>
        </aside>
    </div>

    <!-- Comments -->
    <section class="max-w-4xl border border-slate-200 bg-white p-6 sm:p-8 no-print">
        <div class="pb-3 mb-6 border-b border-slate-200 flex items-center justify-between">
            <h3 class="font-serif text-xl font-bold text-slate-900">পাঠকের মন্তব্য (<?= e(bn_num(count($comments))) ?>)</h3>
            <span class="text-xs text-slate-500">যাচাইকৃত মন্তব্য প্রকাশিত হয়</span>
        </div>

        <div class="space-y-5 mb-8">
            <?php if (!empty($comments)): ?>
                <?php foreach ($comments as $c): ?>
                <div class="pb-4 border-b border-slate-200 last:border-b-0">
                    <div class="text-xs text-slate-500 mb-1.5">
                        <span class="font-semibold text-slate-900 text-sm"><?= e($c['author']) ?></span> · <?= e(bn_relative_time($c['created_at'])) ?>
                    </div>
                    <p class="text-slate-700 text-sm leading-relaxed"><?= e($c['content']) ?></p>
                </div>
                <?php endforeach; ?>
            <?php else: ?>
                <p class="text-slate-500 text-sm">এই প্রতিবেদনে এখনো কোনো মন্তব্য নেই।</p>
            <?php endif; ?>
        </div>

        <div class="bg-slate-50 border border-slate-200 p-5">
            <h4 class="font-serif text-base font-bold text-slate-900 mb-4">মতামত লিখুন</h4>
            <?php if ($commentSaved): ?>
                <div class="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">আপনার মন্তব্যটি অনুমোদনের জন্য জমা হয়েছে। ধন্যবাদ।</div>
            <?php endif; ?>
            <?php if ($commentError): ?>
                <div class="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-medium"><?= e($commentError) ?></div>
            <?php endif; ?>
            <form method="POST" class="space-y-3.5">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="submit_comment" value="1">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম *</label>
                        <input required type="text" name="author" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">ইমেইল *</label>
                        <input required type="email" name="email" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-sm">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">মন্তব্য *</label>
                    <textarea required name="content" rows="3" class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-sm"></textarea>
                </div>
                <button type="submit" class="px-5 py-2 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800">মতামত পাঠান</button>
            </form>
        </div>
    </section>
</div>

<script>
function setArticleSize(px) {
    document.getElementById('articleProse').style.fontSize = px;
}
function copyArticleUrl() {
    if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'কপি হয়েছে';
    setTimeout(() => { btn.textContent = 'শেয়ার'; }, 2000);
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
