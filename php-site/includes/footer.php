<?php
$settings = get_settings();
$allCats = get_categories();
?>
</main>

<footer class="bg-slate-950 text-slate-300 border-t-4 border-primary mt-14 no-print">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-slate-800">
            <div class="lg:col-span-5 space-y-3">
                <a href="index.php" class="font-serif text-2xl font-bold text-white tracking-tight block"><?= e($settings['site_name']) ?></a>
                <p class="text-slate-400 text-sm leading-relaxed max-w-md"><?= e($settings['tagline']) ?></p>
                <div class="pt-2 text-xs text-slate-400 space-y-1">
                    <p>সম্পাদক ও প্রকাশক: <?= e($settings['editor_name']) ?></p>
                    <p>কার্যালয়: <?= e($settings['office_address']) ?></p>
                </div>
            </div>

            <div class="lg:col-span-3">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2.5 mb-3.5 border-b border-slate-800">বিভাগসমূহ</h3>
                <ul class="grid grid-cols-2 gap-2.5 text-sm">
                    <?php foreach ($allCats as $cat): ?>
                        <li><a href="category.php?name=<?= urlencode($cat['name']) ?>" class="text-slate-300 hover:text-white transition-colors"><?= e($cat['name']) ?></a></li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <div class="lg:col-span-2">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2.5 mb-3.5 border-b border-slate-800">অন্যান্য পাতা</h3>
                <ul class="space-y-2 text-sm">
                    <li><a href="page.php?slug=about" class="text-slate-300 hover:text-white">আমাদের সম্পর্কে</a></li>
                    <li><a href="contact.php" class="text-slate-300 hover:text-white">সংবাদ ও মতামত পাঠান</a></li>
                    <li><a href="page.php?slug=privacy" class="text-slate-300 hover:text-white">গোপনীয়তা নীতি</a></li>
                    <li><a href="page.php?slug=terms" class="text-slate-300 hover:text-white">শর্তাবলী</a></li>
                    <li><a href="admin/index.php" class="text-slate-400 hover:text-white">অ্যাডমিন প্যানেল</a></li>
                </ul>
            </div>

            <div class="lg:col-span-2">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2.5 mb-3.5 border-b border-slate-800">বার্তা কক্ষ</h3>
                <div class="space-y-2 text-sm text-slate-400">
                    <p><?= e($settings['contact_email']) ?></p>
                    <p class="font-mono tabular-nums text-xs text-slate-300"><?= e($settings['contact_phone']) ?></p>
                    <div class="pt-2 flex items-center gap-3 text-xs font-medium">
                        <a href="<?= e($settings['facebook_url']) ?>" target="_blank" rel="noreferrer" class="text-slate-400 hover:text-white">ফেসবুক</a>
                        <span>·</span>
                        <a href="<?= e($settings['youtube_url']) ?>" target="_blank" rel="noreferrer" class="text-slate-400 hover:text-white">ইউটিউব</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p><?= e($settings['footer_text']) ?></p>
            <p>সাতক্ষীরা, বাংলাদেশ থেকে প্রকাশিত</p>
        </div>
    </div>
</footer>
</body>
</html>
