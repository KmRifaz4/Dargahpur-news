<?php
require_once __DIR__ . '/../config.php';

if (!empty($_SESSION['admin_user'])) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        $error = 'নিরাপত্তা যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = (string)($_POST['password'] ?? '');
        $stmt = get_db()->prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && $user['status'] === 'Blocked') {
            $error = 'এই অ্যাকাউন্টটি বর্তমানে স্থগিত রয়েছে।';
        } elseif ($user && password_verify($password, $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['admin_user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'full_name' => $user['full_name'],
                'role' => $user['role'],
            ];
            header('Location: index.php');
            exit;
        } else {
            $error = 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়!';
        }
    }
}
$settings = get_settings();
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>অ্যাডমিন লগইন | <?= e($settings['site_name']) ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; }
        h1 { font-family: 'Noto Serif Bengali', serif; }
    </style>
</head>
<body class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="bg-white max-w-md w-full border border-slate-200 p-8 sm:p-10">
        <div class="text-center mb-8 pb-5 border-b border-slate-200">
            <div class="text-xs font-bold uppercase tracking-wider text-red-700 mb-1">বার্তা কক্ষ লগইন</div>
            <h1 class="text-3xl font-bold text-slate-950"><?= e($settings['site_name']) ?></h1>
            <p class="text-xs text-slate-500 mt-1">সম্পাদকীয় ও অ্যাডমিন প্যানেলে প্রবেশ করুন</p>
        </div>

        <?php if ($error): ?>
            <div class="mb-5 bg-red-50 border border-red-200 p-3.5 text-red-800 text-xs font-medium"><?= e($error) ?></div>
        <?php endif; ?>

        <form method="POST" class="space-y-4">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">ইউজারনেম</label>
                <input required type="text" name="username" value="rifaz" class="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">পাসওয়ার্ড</label>
                <input required type="password" name="password" placeholder="পাসওয়ার্ড লিখুন" class="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400">
                <div class="mt-1.5 text-xs text-slate-500 text-right">ডিফল্ট: rifaz / rifaz (লগইনের পর পরিবর্তন করুন)</div>
            </div>
            <button type="submit" class="w-full bg-red-700 text-white text-sm font-semibold py-2.5 rounded-sm hover:bg-red-800 transition-colors">লগইন করুন</button>
        </form>

        <div class="mt-6 pt-5 border-t border-slate-200 text-center">
            <a href="../index.php" class="text-slate-600 hover:text-slate-900 font-medium text-xs">← মূল ওয়েবসাইটে ফিরে যান</a>
        </div>
    </div>
</body>
</html>
