<?php
require_once __DIR__ . '/config.php';

$pdo = get_db();
$settings = get_settings();
$categories = get_categories();
$mode = ($_GET['mode'] ?? 'report') === 'contact' ? 'contact' : 'report';
$successMsg = '';
$errorMsg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        $errorMsg = 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
    } elseif (isset($_POST['submit_report'])) {
        $mode = 'report';
        $title = trim($_POST['title'] ?? '');
        $cat = trim($_POST['category'] ?? 'গ্রামের খবর');
        $author = trim($_POST['author'] ?? 'নাগরিক প্রতিবেদক');
        $location = trim($_POST['location'] ?? 'দরগাহপুর');
        $content = trim($_POST['content'] ?? '');

        if ($title !== '' && $content !== '') {
            $excerpt = mb_substr($content, 0, 140, 'UTF-8') . '...';
            $pdo->prepare('INSERT INTO posts (title, subtitle, excerpt, content, category, author, author_role, location, read_time, image_url, featured, views, tags, publish_date) VALUES (?, "", ?, ?, ?, ?, "স্থানীয় সংবাদদাতা", ?, "৩ মিনিট পাঠ", "assets/images/village_market.jpg", 0, 1, ?, ?)')
                ->execute([$title, $excerpt, $content, $cat, $author, $location, $cat . ', দরগাহপুর', date('Y-m-d H:i:s')]);
            $successMsg = 'আপনার সংবাদ প্রতিবেদনটি সফলভাবে প্রকাশিত হয়েছে!';
        } else {
            $errorMsg = 'অনুগ্রহ করে শিরোনাম ও বিস্তারিত বিবরণ লিখুন।';
        }
    } elseif (isset($_POST['submit_contact'])) {
        $mode = 'contact';
        $name = trim($_POST['name'] ?? '');
        $contact = trim($_POST['contact_info'] ?? '');
        $subject = trim($_POST['subject'] ?? '');
        $message = trim($_POST['message'] ?? '');

        if ($name !== '' && $message !== '') {
            $pdo->prepare('INSERT INTO messages (name, contact_info, subject, message, created_at) VALUES (?, ?, ?, ?, ?)')
                ->execute([$name, $contact, $subject, $message, date('Y-m-d H:i:s')]);
            $successMsg = 'আপনার বার্তাটি বার্তা কক্ষে পৌঁছেছে। ধন্যবাদ।';
        } else {
            $errorMsg = 'অনুগ্রহ করে প্রয়োজনীয় তথ্য পূরণ করুন।';
        }
    }
}

$pageTitle = 'সংবাদ পাঠান ও যোগাযোগ';
require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-4xl mx-auto space-y-8">
    <header class="bg-slate-50 border border-slate-200 p-8 space-y-2">
        <div class="text-xs font-bold uppercase tracking-wider text-primary">বার্তা কক্ষ ও যোগাযোগ</div>
        <h1 class="font-serif text-3xl sm:text-4xl font-bold text-slate-950">সংবাদ পাঠান অথবা যোগাযোগ করুন</h1>
        <p class="text-sm text-slate-600 max-w-2xl">আপনার এলাকার যেকোনো জনগুরুত্বপূর্ণ সংবাদ, উন্নয়ন সমস্যা বা মতামত সরাসরি পোর্টালে পাঠাতে পারেন।</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-8 bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200 w-fit">
                <a href="contact.php?mode=report" class="px-4 py-1.5 text-xs font-semibold <?= $mode === 'report' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600' ?>">সংবাদ প্রেরণ</a>
                <a href="contact.php?mode=contact" class="px-4 py-1.5 text-xs font-semibold <?= $mode === 'contact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600' ?>">সাধারণ যোগাযোগ</a>
            </div>

            <?php if ($successMsg): ?>
                <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-3">
                    <span><?= e($successMsg) ?></span>
                    <a href="index.php" class="underline font-semibold whitespace-nowrap">প্রচ্ছদ দেখুন</a>
                </div>
            <?php endif; ?>
            <?php if ($errorMsg): ?>
                <div class="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-medium"><?= e($errorMsg) ?></div>
            <?php endif; ?>

            <?php if ($mode === 'report'): ?>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="submit_report" value="1">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">সংবাদের শিরোনাম *</label>
                    <input required type="text" name="title" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">বিভাগ *</label>
                        <select name="category" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm">
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?= e($cat['name']) ?>"><?= e($cat['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">প্রতিবেদকের নাম *</label>
                        <input required type="text" name="author" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">স্থান</label>
                        <input type="text" name="location" value="দরগাহপুর" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">বিস্তারিত প্রতিবেদন *</label>
                    <textarea required name="content" rows="6" class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-sm"></textarea>
                </div>
                <button type="submit" class="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800">সংবাদ প্রকাশ করুন</button>
            </form>
            <?php else: ?>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="submit_contact" value="1">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">আপনার নাম *</label>
                        <input required type="text" name="name" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1.5">ইমেইল বা ফোন *</label>
                        <input required type="text" name="contact_info" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">বিষয় *</label>
                    <input required type="text" name="subject" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">বার্তা *</label>
                    <textarea required name="message" rows="5" class="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-sm"></textarea>
                </div>
                <button type="submit" class="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-red-800">বার্তা পাঠান</button>
            </form>
            <?php endif; ?>
        </div>

        <aside class="md:col-span-4">
            <div class="bg-white border border-slate-200 p-6 space-y-3">
                <h3 class="font-serif text-lg font-bold text-slate-900 pb-2.5 border-b border-slate-200">কার্যালয়ের ঠিকানা</h3>
                <dl class="divide-y divide-slate-200 text-xs">
                    <div class="py-2.5"><dt class="text-slate-500">দপ্তর</dt><dd class="font-medium text-slate-900 mt-1"><?= e($settings['office_address']) ?></dd></div>
                    <div class="py-2.5"><dt class="text-slate-500">ইমেইল</dt><dd class="font-mono text-slate-900 mt-1"><?= e($settings['contact_email']) ?></dd></div>
                    <div class="py-2.5"><dt class="text-slate-500">ফোন</dt><dd class="font-mono tabular-nums text-slate-900 mt-1"><?= e($settings['contact_phone']) ?></dd></div>
                </dl>
            </div>
        </aside>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
