<?php
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['admin_user'])) {
    header('Location: login.php');
    exit;
}

$pdo = get_db();
$admin = $_SESSION['admin_user'];
$tab = $_GET['tab'] ?? 'overview';
$editId = (int)($_GET['edit'] ?? 0);
$flash = '';
$flashType = 'success';

// ছবি আপলোড হেল্পার
function handle_image_upload(array $file): ?string {
    if (empty($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) return null;
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!isset($allowed[$mime])) return null;
    if ($file['size'] > 5 * 1024 * 1024) return null;

    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $filename = 'news_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $allowed[$mime];
    if (move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $filename)) {
        return 'uploads/' . $filename;
    }
    return null;
}

// POST অ্যাকশনসমূহ
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        $flash = 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
        $flashType = 'error';
    } else {
        $action = $_POST['action'] ?? '';

        if ($action === 'save_post') {
            $postId = (int)($_POST['post_id'] ?? 0);
            $title = trim($_POST['title'] ?? '');
            $subtitle = trim($_POST['subtitle'] ?? '');
            $category = trim($_POST['category'] ?? 'গ্রামের খবর');
            $author = trim($_POST['author'] ?? $admin['full_name']);
            $location = trim($_POST['location'] ?? 'দরগাহপুর');
            $content = trim($_POST['content'] ?? '');
            $excerpt = trim($_POST['excerpt'] ?? '');
            if ($excerpt === '') $excerpt = mb_substr($content, 0, 140, 'UTF-8') . '...';
            $imageCaption = trim($_POST['image_caption'] ?? '');
            $pullQuote = trim($_POST['pull_quote'] ?? '');
            $tags = trim($_POST['tags'] ?? $category . ', দরগাহপুর');
            $featured = isset($_POST['featured']) ? 1 : 0;

            $imageUrl = trim($_POST['image_url'] ?? '');
            if (!empty($_FILES['image_file']['tmp_name'])) {
                $uploaded = handle_image_upload($_FILES['image_file']);
                if ($uploaded) $imageUrl = $uploaded;
            }
            if ($imageUrl === '') $imageUrl = 'assets/images/village_market.jpg';

            if ($title !== '' && $content !== '') {
                if ($postId > 0) {
                    $pdo->prepare('UPDATE posts SET title=?, subtitle=?, excerpt=?, content=?, category=?, author=?, location=?, image_url=?, image_caption=?, pull_quote=?, featured=?, tags=? WHERE id=?')
                        ->execute([$title, $subtitle, $excerpt, $content, $category, $author, $location, $imageUrl, $imageCaption, $pullQuote, $featured, $tags, $postId]);
                    $flash = 'সংবাদটি সফলভাবে হালনাগাদ করা হয়েছে।';
                } else {
                    $pdo->prepare('INSERT INTO posts (title, subtitle, excerpt, content, category, author, location, image_url, image_caption, pull_quote, featured, views, tags, publish_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)')
                        ->execute([$title, $subtitle, $excerpt, $content, $category, $author, $location, $imageUrl, $imageCaption, $pullQuote, $featured, $tags, date('Y-m-d H:i:s')]);
                    $flash = 'নতুন সংবাদ সফলভাবে প্রকাশিত হয়েছে।';
                }
                $tab = 'posts';
                $editId = 0;
            }
        } elseif ($action === 'delete_post') {
            $pdo->prepare('DELETE FROM posts WHERE id = ?')->execute([(int)$_POST['id']]);
            $flash = 'সংবাদটি মুছে ফেলা হয়েছে।';
            $tab = 'posts';
        } elseif ($action === 'add_category') {
            $name = trim($_POST['name'] ?? '');
            $desc = trim($_POST['description'] ?? '');
            if ($name !== '') {
                try {
                    $pdo->prepare('INSERT INTO categories (name, description) VALUES (?, ?)')->execute([$name, $desc]);
                    $flash = 'নতুন বিভাগ যুক্ত করা হয়েছে।';
                } catch (PDOException $e) {
                    $flash = 'এই বিভাগটি আগেই রয়েছে।';
                    $flashType = 'error';
                }
            }
            $tab = 'categories';
        } elseif ($action === 'delete_category') {
            $pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([(int)$_POST['id']]);
            $flash = 'বিভাগটি মুছে ফেলা হয়েছে।';
            $tab = 'categories';
        } elseif ($action === 'approve_comment') {
            $pdo->prepare('UPDATE comments SET approved = 1 WHERE id = ?')->execute([(int)$_POST['id']]);
            $flash = 'মন্তব্য অনুমোদিত হয়েছে।';
            $tab = 'comments';
        } elseif ($action === 'delete_comment') {
            $pdo->prepare('DELETE FROM comments WHERE id = ?')->execute([(int)$_POST['id']]);
            $flash = 'মন্তব্য মুছে ফেলা হয়েছে।';
            $tab = 'comments';
        } elseif ($action === 'save_rate') {
            $item = trim($_POST['item_name'] ?? '');
            $price = trim($_POST['price_range'] ?? '');
            if ($item !== '' && $price !== '') {
                $pdo->prepare('INSERT INTO market_rates (item_name, price_range, sort_order) VALUES (?, ?, 10)')->execute([$item, $price]);
                $flash = 'নতুন বাজার দর যুক্ত করা হয়েছে।';
            }
            $tab = 'rates';
        } elseif ($action === 'delete_rate') {
            $pdo->prepare('DELETE FROM market_rates WHERE id = ?')->execute([(int)$_POST['id']]);
            $flash = 'বাজার দর মুছে ফেলা হয়েছে।';
            $tab = 'rates';
        } elseif ($action === 'delete_message') {
            $pdo->prepare('DELETE FROM messages WHERE id = ?')->execute([(int)$_POST['id']]);
            $flash = 'বার্তা মুছে ফেলা হয়েছে।';
            $tab = 'messages';
        } elseif ($action === 'save_settings') {
            $keys = ['site_name', 'tagline', 'editor_name', 'footer_text', 'office_address', 'contact_email', 'contact_phone', 'facebook_url', 'youtube_url'];
            $stmt = $pdo->prepare('REPLACE INTO settings (setting_key, setting_value) VALUES (?, ?)');
            foreach ($keys as $k) {
                $stmt->execute([$k, trim($_POST[$k] ?? '')]);
            }
            $stmt->execute(['breaking_enabled', isset($_POST['breaking_enabled']) ? '1' : '0']);
            $flash = 'পোর্টাল সেটিংস সংরক্ষিত হয়েছে।';
            $tab = 'settings';
        } elseif ($action === 'change_password') {
            $newPass = (string)($_POST['new_password'] ?? '');
            if (strlen($newPass) >= 4) {
                $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
                    ->execute([password_hash($newPass, PASSWORD_DEFAULT), $admin['id']]);
                $flash = 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।';
            } else {
                $flash = 'পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।';
                $flashType = 'error';
            }
            $tab = 'settings';
        }
    }
}

$settings = get_settings();
$categories = get_categories();
$posts = $pdo->query('SELECT * FROM posts ORDER BY publish_date DESC, id DESC')->fetchAll();
$comments = $pdo->query('SELECT * FROM comments ORDER BY id DESC')->fetchAll();
$rates = $pdo->query('SELECT * FROM market_rates ORDER BY sort_order ASC, id ASC')->fetchAll();
$messages = $pdo->query('SELECT * FROM messages ORDER BY id DESC')->fetchAll();

$totalViews = array_sum(array_map(fn($p) => (int)$p['views'], $posts));
$pendingComments = count(array_filter($comments, fn($c) => (int)$c['approved'] === 0));

$editPost = null;
if ($tab === 'editor' && $editId > 0) {
    $st = $pdo->prepare('SELECT * FROM posts WHERE id = ?');
    $st->execute([$editId]);
    $editPost = $st->fetch();
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>অ্যাডমিন প্যানেল | <?= e($settings['site_name']) ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Noto+Serif+Bengali:wght@600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; }
        h1, h2, h3 { font-family: 'Noto Serif Bengali', serif; }
        .tabular-nums { font-variant-numeric: tabular-nums; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex">

<!-- Sidebar -->
<aside class="w-64 bg-slate-950 text-slate-200 shrink-0 hidden md:flex flex-col fixed h-full border-r border-slate-800">
    <div class="p-6 border-b border-slate-800">
        <a href="index.php" class="text-xl font-bold text-white block"><?= e($settings['site_name']) ?></a>
        <p class="text-xs text-slate-400 mt-1">PHP বার্তা কক্ষ ও সিএমএস</p>
    </div>
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto text-sm">
        <a href="../index.php" target="_blank" class="block px-3.5 py-2.5 rounded-sm text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 mb-5">মূল ওয়েবসাইট দেখুন ↗</a>
        <?php
        $nav = [
            'overview' => 'ড্যাশবোর্ড',
            'posts' => 'সংবাদ ও পোস্ট',
            'editor' => '+ নতুন সংবাদ লিখুন',
            'categories' => 'বিভাগসমূহ',
            'comments' => 'পাঠকের মন্তব্য (' . bn_num($pendingComments) . ')',
            'rates' => 'বাজার দর',
            'messages' => 'বার্তা ইনবক্স (' . bn_num(count($messages)) . ')',
            'settings' => 'পোর্টাল সেটিংস',
        ];
        foreach ($nav as $key => $label):
            $active = ($tab === $key);
        ?>
            <a href="index.php?tab=<?= $key ?>" class="block px-3.5 py-2.5 rounded-sm font-medium <?= $active ? 'bg-red-700 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-900' ?>">
                <?= e($label) ?>
            </a>
        <?php endforeach; ?>
    </nav>
    <div class="p-4 border-t border-slate-800">
        <a href="logout.php" class="block px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-slate-900 rounded-sm">লগ আউট করুন</a>
    </div>
</aside>

<!-- Main Area -->
<div class="flex-1 md:ml-64 flex flex-col min-h-screen">
    <header class="bg-white h-16 flex items-center justify-between px-6 sm:px-8 border-b border-slate-200 sticky top-0 z-30">
        <div class="text-xs">
            <strong class="text-slate-900"><?= e($admin['full_name']) ?></strong> · <span class="text-slate-500"><?= e($admin['role']) ?></span>
        </div>
        <div class="flex items-center gap-3">
            <a href="index.php?tab=editor" class="bg-red-700 text-white py-2 px-4 rounded-sm font-semibold text-xs hover:bg-red-800">+ নতুন সংবাদ প্রকাশ</a>
            <a href="logout.php" class="md:hidden text-xs text-red-700 font-semibold">লগ আউট</a>
        </div>
    </header>

    <main class="p-6 sm:p-8 flex-1 space-y-6">
        <!-- Mobile Quick Nav -->
        <div class="md:hidden flex gap-2 overflow-x-auto pb-2 text-xs">
            <?php foreach ($nav as $key => $label): ?>
                <a href="index.php?tab=<?= $key ?>" class="px-3 py-1.5 border whitespace-nowrap <?= $tab === $key ? 'bg-red-700 text-white border-red-700' : 'bg-white text-slate-700 border-slate-200' ?>"><?= e($label) ?></a>
            <?php endforeach; ?>
        </div>

        <?php if ($flash): ?>
            <div class="p-3.5 text-xs font-medium border <?= $flashType === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900' ?>">
                <?= e($flash) ?>
            </div>
        <?php endif; ?>

        <?php if ($tab === 'overview'): ?>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div class="bg-white p-6 border border-slate-200"><p class="text-slate-500 text-xs">মোট প্রকাশিত সংবাদ</p><p class="text-3xl font-bold mt-2 tabular-nums"><?= e(bn_num(count($posts))) ?></p></div>
                <div class="bg-white p-6 border border-slate-200"><p class="text-slate-500 text-xs">সংবাদ বিভাগ</p><p class="text-3xl font-bold mt-2 tabular-nums"><?= e(bn_num(count($categories))) ?></p></div>
                <div class="bg-white p-6 border border-slate-200"><p class="text-slate-500 text-xs">অপেক্ষমাণ মন্তব্য</p><p class="text-3xl font-bold mt-2 tabular-nums"><?= e(bn_num($pendingComments)) ?></p></div>
                <div class="bg-white p-6 border border-slate-200"><p class="text-slate-500 text-xs">সর্বমোট পাঠ সংখ্যা</p><p class="text-3xl font-bold mt-2 tabular-nums"><?= e(bn_num($totalViews)) ?></p></div>
            </div>
            <div class="bg-white border border-slate-200 p-6">
                <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                    <h2 class="text-lg font-bold">সাম্প্রতিক সংবাদসমূহ</h2>
                    <a href="index.php?tab=posts" class="text-xs font-semibold text-red-700 hover:underline">সবগুলো দেখুন →</a>
                </div>
                <div class="divide-y divide-slate-200">
                    <?php foreach (array_slice($posts, 0, 5) as $p): ?>
                    <div class="py-3 flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <a href="index.php?tab=editor&edit=<?= (int)$p['id'] ?>" class="font-semibold text-sm hover:text-red-700 block truncate"><?= e($p['title']) ?></a>
                            <div class="text-xs text-slate-500"><?= e($p['category']) ?> · <?= e(bn_date($p['publish_date'])) ?></div>
                        </div>
                        <span class="text-xs font-mono text-slate-500 tabular-nums shrink-0"><?= e(bn_num($p['views'])) ?> পাঠ</span>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

        <?php elseif ($tab === 'posts'): ?>
            <div class="bg-white border border-slate-200 overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                        <tr>
                            <th class="px-5 py-3.5">সংবাদ শিরোনাম</th>
                            <th class="px-5 py-3.5">বিভাগ</th>
                            <th class="px-5 py-3.5">তারিখ</th>
                            <th class="px-5 py-3.5 text-right">পাঠ</th>
                            <th class="px-5 py-3.5 text-right">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        <?php foreach ($posts as $p): ?>
                        <tr class="hover:bg-slate-50">
                            <td class="px-5 py-3.5">
                                <a href="../post.php?id=<?= (int)$p['id'] ?>" target="_blank" class="font-semibold text-slate-900 hover:text-red-700 block max-w-md truncate"><?= e($p['title']) ?></a>
                                <div class="text-xs text-slate-500"><?= e($p['author']) ?> <?= (int)$p['featured'] === 1 ? '· প্রধান সংবাদ' : '' ?></div>
                            </td>
                            <td class="px-5 py-3.5 text-xs font-semibold text-red-700"><?= e($p['category']) ?></td>
                            <td class="px-5 py-3.5 text-xs text-slate-500"><?= e(bn_date($p['publish_date'])) ?></td>
                            <td class="px-5 py-3.5 text-right text-xs font-mono tabular-nums"><?= e(bn_num($p['views'])) ?></td>
                            <td class="px-5 py-3.5 text-right whitespace-nowrap space-x-2">
                                <a href="index.php?tab=editor&edit=<?= (int)$p['id'] ?>" class="text-xs font-semibold text-slate-700 hover:text-slate-950 underline">সম্পাদনা</a>
                                <form method="POST" class="inline" onsubmit="return confirm('এই সংবাদটি মুছে ফেলবেন?')">
                                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                                    <input type="hidden" name="action" value="delete_post">
                                    <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
                                    <button type="submit" class="text-xs font-semibold text-red-700 hover:underline">মুছুন</button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

        <?php elseif ($tab === 'editor'): ?>
            <div class="max-w-4xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5">
                <h1 class="text-2xl font-bold"><?= $editPost ? 'সংবাদ সম্পাদনা করুন' : 'নতুন সংবাদ প্রকাশ করুন' ?></h1>
                <form method="POST" enctype="multipart/form-data" class="space-y-4">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="action" value="save_post">
                    <input type="hidden" name="post_id" value="<?= (int)($editPost['id'] ?? 0) ?>">

                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">সংবাদের শিরোনাম *</label>
                        <input required type="text" name="title" value="<?= e($editPost['title'] ?? '') ?>" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-base font-bold">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">উপ-শিরোনাম (ঐচ্ছিক)</label>
                        <input type="text" name="subtitle" value="<?= e($editPost['subtitle'] ?? '') ?>" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-sm">
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">বিভাগ</label>
                            <select name="category" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm">
                                <?php foreach ($categories as $c): ?>
                                    <option value="<?= e($c['name']) ?>" <?= (($editPost['category'] ?? '') === $c['name']) ? 'selected' : '' ?>><?= e($c['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">প্রতিবেদকের নাম</label>
                            <input type="text" name="author" value="<?= e($editPost['author'] ?? $admin['full_name']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">স্থান</label>
                            <input type="text" name="location" value="<?= e($editPost['location'] ?? 'দরগাহপুর') ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">ছবি আপলোড করুন (JPG / PNG / WEBP)</label>
                            <input type="file" name="image_file" accept="image/*" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">অথবা ছবির লিঙ্ক (URL / পাথ)</label>
                            <input type="text" name="image_url" value="<?= e($editPost['image_url'] ?? 'assets/images/school_sports.jpg') ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">ছবির ক্যাপশন</label>
                        <input type="text" name="image_caption" value="<?= e($editPost['image_caption'] ?? '') ?>" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">বিস্তারিত সংবাদ *</label>
                        <textarea required name="content" rows="10" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm leading-relaxed"><?= e($editPost['content'] ?? '') ?></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">বিশেষ উদ্ধৃতি (Pull Quote)</label>
                        <input type="text" name="pull_quote" value="<?= e($editPost['pull_quote'] ?? '') ?>" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 text-sm">
                    </div>
                    <div class="flex items-center gap-2.5 p-3.5 bg-slate-50 border border-slate-200">
                        <input type="checkbox" id="featured" name="featured" value="1" <?= !empty($editPost['featured']) ? 'checked' : '' ?>>
                        <label for="featured" class="text-xs font-semibold text-slate-800">প্রথম পাতার প্রধান সংবাদ (Featured) হিসেবে দেখান</label>
                    </div>
                    <div class="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <a href="index.php?tab=posts" class="px-4 py-2 text-xs text-slate-600 font-semibold">বাতিল</a>
                        <button type="submit" class="px-6 py-2.5 bg-red-700 text-white text-xs font-semibold rounded-sm hover:bg-red-800"><?= $editPost ? 'আপডেট করুন' : 'সংবাদ প্রকাশ করুন' ?></button>
                    </div>
                </form>
            </div>

        <?php elseif ($tab === 'categories'): ?>
            <div class="max-w-3xl space-y-6">
                <form method="POST" class="bg-white p-6 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="action" value="add_category">
                    <div class="sm:col-span-4"><label class="block text-xs font-semibold mb-1">বিভাগের নাম *</label><input required type="text" name="name" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    <div class="sm:col-span-5"><label class="block text-xs font-semibold mb-1">সংক্ষিপ্ত বিবরণ</label><input type="text" name="description" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    <div class="sm:col-span-3"><button type="submit" class="w-full bg-red-700 text-white text-xs font-semibold py-2.5 rounded-sm">+ যুক্ত করুন</button></div>
                </form>
                <div class="bg-white border border-slate-200">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 border-b border-slate-200 text-xs text-slate-500"><tr><th class="px-5 py-3">বিভাগ</th><th class="px-5 py-3">বিবরণ</th><th class="px-5 py-3 text-right">অ্যাকশন</th></tr></thead>
                        <tbody class="divide-y divide-slate-200">
                            <?php foreach ($categories as $c): ?>
                            <tr>
                                <td class="px-5 py-3.5 font-semibold"><?= e($c['name']) ?></td>
                                <td class="px-5 py-3.5 text-xs text-slate-500"><?= e($c['description']) ?></td>
                                <td class="px-5 py-3.5 text-right">
                                    <form method="POST" class="inline"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="delete_category"><input type="hidden" name="id" value="<?= (int)$c['id'] ?>"><button type="submit" class="text-xs text-red-700 font-semibold">মুছুন</button></form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

        <?php elseif ($tab === 'comments'): ?>
            <div class="max-w-4xl space-y-4">
                <?php foreach ($comments as $c): ?>
                <div class="bg-white p-5 border border-slate-200 space-y-2.5">
                    <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div><strong class="text-sm text-slate-900"><?= e($c['author']) ?></strong> · <?= e($c['email']) ?> · <span class="font-semibold <?= (int)$c['approved'] === 1 ? 'text-emerald-700' : 'text-amber-700' ?>"><?= (int)$c['approved'] === 1 ? 'প্রকাশিত' : 'অনুমোদনের অপেক্ষায়' ?></span></div>
                        <div class="space-x-2">
                            <?php if ((int)$c['approved'] === 0): ?>
                            <form method="POST" class="inline"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="approve_comment"><input type="hidden" name="id" value="<?= (int)$c['id'] ?>"><button type="submit" class="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">অনুমোদন দিন</button></form>
                            <?php endif; ?>
                            <form method="POST" class="inline"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="delete_comment"><input type="hidden" name="id" value="<?= (int)$c['id'] ?>"><button type="submit" class="text-red-700 font-semibold">মুছুন</button></form>
                        </div>
                    </div>
                    <p class="text-sm bg-slate-50 p-3.5 border border-slate-200">“<?= e($c['content']) ?>”</p>
                </div>
                <?php endforeach; ?>
                <?php if (empty($comments)): ?><div class="bg-white border border-slate-200 p-10 text-center text-xs text-slate-500">কোনো মন্তব্য নেই।</div><?php endif; ?>
            </div>

        <?php elseif ($tab === 'rates'): ?>
            <div class="max-w-3xl space-y-6">
                <form method="POST" class="bg-white p-6 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="action" value="save_rate">
                    <div class="sm:col-span-5"><label class="block text-xs font-semibold mb-1">পণ্যের নাম *</label><input required type="text" name="item_name" placeholder="উদা: সোনালী মুরগি" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    <div class="sm:col-span-4"><label class="block text-xs font-semibold mb-1">দর *</label><input required type="text" name="price_range" placeholder="উদা: ২৯০ – ৩১০ ৳" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    <div class="sm:col-span-3"><button type="submit" class="w-full bg-red-700 text-white text-xs font-semibold py-2.5 rounded-sm">+ যুক্ত করুন</button></div>
                </form>
                <div class="bg-white border border-slate-200">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 border-b border-slate-200 text-xs text-slate-500"><tr><th class="px-5 py-3">পণ্য</th><th class="px-5 py-3">আজকের দর</th><th class="px-5 py-3 text-right">অ্যাকশন</th></tr></thead>
                        <tbody class="divide-y divide-slate-200">
                            <?php foreach ($rates as $r): ?>
                            <tr>
                                <td class="px-5 py-3.5 font-medium"><?= e($r['item_name']) ?></td>
                                <td class="px-5 py-3.5 font-mono text-xs font-semibold"><?= e($r['price_range']) ?></td>
                                <td class="px-5 py-3.5 text-right"><form method="POST" class="inline"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="delete_rate"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>"><button type="submit" class="text-xs text-red-700 font-semibold">মুছুন</button></form></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

        <?php elseif ($tab === 'messages'): ?>
            <div class="max-w-4xl space-y-4">
                <?php foreach ($messages as $m): ?>
                <div class="bg-white p-5 border border-slate-200 space-y-2">
                    <div class="flex justify-between items-start text-xs">
                        <div><strong class="text-sm text-slate-900"><?= e($m['subject']) ?></strong> — <?= e($m['name']) ?> (<?= e($m['contact_info']) ?>)</div>
                        <form method="POST" class="inline"><input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>"><input type="hidden" name="action" value="delete_message"><input type="hidden" name="id" value="<?= (int)$m['id'] ?>"><button type="submit" class="text-red-700 font-semibold">মুছুন</button></form>
                    </div>
                    <p class="text-sm text-slate-700 bg-slate-50 p-3 border border-slate-200"><?= e($m['message']) ?></p>
                </div>
                <?php endforeach; ?>
                <?php if (empty($messages)): ?><div class="bg-white border border-slate-200 p-10 text-center text-xs text-slate-500">কোনো বার্তা নেই।</div><?php endif; ?>
            </div>

        <?php elseif ($tab === 'settings'): ?>
            <div class="max-w-3xl space-y-6">
                <form method="POST" class="bg-white p-6 border border-slate-200 space-y-4">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="action" value="save_settings">
                    <h2 class="text-lg font-bold pb-2 border-b border-slate-200">পোর্টাল সেটিংস</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label class="block text-xs font-semibold mb-1">পত্রিকার নাম</label><input type="text" name="site_name" value="<?= e($settings['site_name']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                        <div><label class="block text-xs font-semibold mb-1">প্রধান সম্পাদক</label><input type="text" name="editor_name" value="<?= e($settings['editor_name']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    </div>
                    <div><label class="block text-xs font-semibold mb-1">স্লোগান / বিবরণ</label><input type="text" name="tagline" value="<?= e($settings['tagline']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label class="block text-xs font-semibold mb-1">ইমেইল</label><input type="text" name="contact_email" value="<?= e($settings['contact_email']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                        <div><label class="block text-xs font-semibold mb-1">ফোন</label><input type="text" name="contact_phone" value="<?= e($settings['contact_phone']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    </div>
                    <div><label class="block text-xs font-semibold mb-1">অফিস ঠিকানা</label><input type="text" name="office_address" value="<?= e($settings['office_address']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label class="block text-xs font-semibold mb-1">ফেসবুক লিঙ্ক</label><input type="text" name="facebook_url" value="<?= e($settings['facebook_url']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                        <div><label class="block text-xs font-semibold mb-1">ইউটিউব লিঙ্ক</label><input type="text" name="youtube_url" value="<?= e($settings['youtube_url']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    </div>
                    <div><label class="block text-xs font-semibold mb-1">ফুটার টেক্সট</label><input type="text" name="footer_text" value="<?= e($settings['footer_text']) ?>" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    <div class="flex items-center gap-2"><input type="checkbox" id="brk" name="breaking_enabled" value="1" <?= ($settings['breaking_enabled'] ?? '1') === '1' ? 'checked' : '' ?>><label for="brk" class="text-xs font-semibold">সদ্যপ্রাপ্ত শিরোনাম বার চালু রাখুন</label></div>
                    <button type="submit" class="px-6 py-2.5 bg-red-700 text-white text-xs font-semibold rounded-sm">সেটিংস সংরক্ষণ করুন</button>
                </form>

                <form method="POST" class="bg-white p-6 border border-slate-200 space-y-4">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="action" value="change_password">
                    <h2 class="text-lg font-bold pb-2 border-b border-slate-200">অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h2>
                    <div><label class="block text-xs font-semibold mb-1">নতুন পাসওয়ার্ড *</label><input required type="password" name="new_password" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm"></div>
                    <button type="submit" class="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-sm">পাসওয়ার্ড আপডেট করুন</button>
                </form>
            </div>
        <?php endif; ?>
    </main>
</div>
</body>
</html>
