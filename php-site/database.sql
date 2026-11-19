-- দরগাহপুর সংবাদ — ঐচ্ছিক MySQL ডাটাবেস স্কিমা
-- দ্রষ্টব্য: ডিফল্টভাবে সাইটটি SQLite দিয়ে কোনো সেটআপ ছাড়াই চলে।
-- আপনি চাইলে phpMyAdmin-এ এই ফাইলটি ইমপোর্ট করে config.php তে DB_DRIVER = 'mysql' করতে পারেন।

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(120) NOT NULL,
    author VARCHAR(120) NOT NULL,
    author_role VARCHAR(120) DEFAULT 'নিজস্ব প্রতিবেদক',
    location VARCHAR(120) DEFAULT 'দরগাহপুর',
    read_time VARCHAR(60) DEFAULT '৩ মিনিট পাঠ',
    image_url VARCHAR(255) NOT NULL,
    image_caption TEXT,
    pull_quote TEXT,
    featured TINYINT(1) DEFAULT 0,
    views INT DEFAULT 0,
    tags VARCHAR(255) DEFAULT 'দরগাহপুর',
    publish_date DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    content TEXT NOT NULL,
    approved TINYINT(1) DEFAULT 0,
    created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS market_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(160) NOT NULL,
    price_range VARCHAR(80) NOT NULL,
    sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    contact_info VARCHAR(160) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(80) PRIMARY KEY,
    setting_value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    full_name VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(40) DEFAULT 'Editor',
    status VARCHAR(40) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
