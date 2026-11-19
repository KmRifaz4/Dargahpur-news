<?php
/**
 * দরগাহপুর সংবাদ — কনফিগারেশন ফাইল
 * ডিফল্টভাবে SQLite ডাটাবেস ব্যবহার করে (কোনো সেটআপ ছাড়াই সরাসরি cPanel হোস্টিংয়ে চলবে)।
 * আপনি চাইলে নিচে DB_DRIVER = 'mysql' করে MySQL ডাটাবেস ব্যবহার করতে পারেন।
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

date_default_timezone_set('Asia/Dhaka');

// ডাটাবেস মোড: 'sqlite' (জিরো-কনফিগ, রেকমেন্ডেড) অথবা 'mysql'
define('DB_DRIVER', 'sqlite');

// SQLite সেটিংস (DB_DRIVER = 'sqlite' হলে)
define('SQLITE_PATH', __DIR__ . '/data/dargahpur.sqlite');

// MySQL সেটিংস (শুধুমাত্র DB_DRIVER = 'mysql' করলে এগুলো পূরণ করুন)
define('MYSQL_HOST', 'localhost');
define('MYSQL_DB', 'dargahpur_news');
define('MYSQL_USER', 'root');
define('MYSQL_PASS', '');

// ডাটাবেস কানেকশন
function get_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        if (DB_DRIVER === 'mysql') {
            $dsn = 'mysql:host=' . MYSQL_HOST . ';dbname=' . MYSQL_DB . ';charset=utf8mb4';
            $pdo = new PDO($dsn, MYSQL_USER, MYSQL_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } else {
            $dataDir = dirname(SQLITE_PATH);
            if (!is_dir($dataDir)) {
                mkdir($dataDir, 0755, true);
            }
            $pdo = new PDO('sqlite:' . SQLITE_PATH, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $pdo->exec('PRAGMA foreign_keys = ON;');
        }
    } catch (PDOException $e) {
        http_response_code(500);
        die('ডাটাবেস সংযোগ ব্যর্থ হয়েছে। অনুগ্রহ করে config.php যাচাই করুন।');
    }

    return $pdo;
}

// নিরাপদ HTML আউটপুট (XSS সুরক্ষা)
function e(?string $str): string {
    return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর
function bn_num($number): string {
    $en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    $bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str_replace($en, $bn, (string)$number);
}

// বাংলা তারিখ ফরম্যাট
function bn_date(string $datetime = 'now', bool $withWeekday = false): string {
    $ts = strtotime($datetime) ?: time();
    $days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    $months = [
        1 => 'জানুয়ারি', 2 => 'ফেব্রুয়ারি', 3 => 'মার্চ', 4 => 'এপ্রিল',
        5 => 'মে', 6 => 'জুন', 7 => 'জুলাই', 8 => 'আগস্ট',
        9 => 'সেপ্টেম্বর', 10 => 'অক্টোবর', 11 => 'নভেম্বর', 12 => 'ডিসেম্বর'
    ];
    $d = bn_num(date('j', $ts));
    $m = $months[(int)date('n', $ts)];
    $y = bn_num(date('Y', $ts));
    if ($withWeekday) {
        $w = $days[(int)date('w', $ts)];
        return "{$w}, {$d} {$m} {$y}";
    }
    return "{$d} {$m} {$y}";
}

// আপেক্ষিক সময় (যেমন: ২৮ মিনিট আগে)
function bn_relative_time(string $datetime): string {
    $ts = strtotime($datetime);
    if (!$ts) return bn_date($datetime);
    $diff = max(60, time() - $ts);
    $mins = (int)floor($diff / 60);
    if ($mins < 60) {
        return bn_num($mins) . ' মিনিট আগে';
    }
    $hours = (int)floor($mins / 60);
    if ($hours < 24) {
        return bn_num($hours) . ' ঘণ্টা আগে';
    }
    $days = (int)floor($hours / 24);
    if ($days === 1) return 'গতকাল';
    if ($days < 7) {
        return bn_num($days) . ' দিন আগে';
    }
    return bn_date($datetime);
}

// CSRF টোকেন তৈরি ও যাচাই
function csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf(?string $token): bool {
    return !empty($token) && !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// সাইট সেটিংস লোড
function get_settings(): array {
    static $settings = null;
    if ($settings !== null) return $settings;
    $pdo = get_db();
    $rows = $pdo->query('SELECT setting_key, setting_value FROM settings')->fetchAll();
    $settings = [];
    foreach ($rows as $r) {
        $settings[$r['setting_key']] = $r['setting_value'];
    }
    return $settings;
}

// ক্যাটাগরি তালিকা
function get_categories(): array {
    return get_db()->query('SELECT * FROM categories ORDER BY id ASC')->fetchAll();
}

// অটো-ইনস্টল (প্রথমবার ওপেন হলে টেবিল ও ডেমো ডাটা তৈরি হবে)
require_once __DIR__ . '/install_db.php';
ensure_database_initialized();
