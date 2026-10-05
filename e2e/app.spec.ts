import { expect, test } from '@playwright/test';

test('home and primary navigation render', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /تعلّم القرآن/ })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'التنقل الرئيسي' })).toBeVisible();
  await page.getByRole('navigation', { name: 'التنقل الرئيسي' }).getByRole('link', { name: 'القرآن', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'النص الذكي' })).toBeVisible();
});

test('catalogue accepts normalized search and filters', async ({ page }) => {
  await page.goto('/quran?view=smart');
  const search = page.getByRole('textbox', { name: 'ابحث عن سورة' });
  await search.fill('الاخلاص');
  await expect(page.getByRole('button', { name: /112 الإخلاص/ })).toBeVisible();
  await search.fill('');
  await page.getByRole('button', { name: 'التسميع الذكي متاح', exact: true }).click();
  await expect(page.getByRole('button', { name: /112 الإخلاص/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /1 الفاتحة/ })).toHaveCount(0);
});

test('three Quran views are truthful', async ({ page }) => {
  await page.goto('/quran?view=smart');
  await expect(page.getByRole('heading', { name: /الفاتحة/ })).toBeVisible();
  await page.getByRole('tab', { name: 'المصحف الإشاري' }).click();
  await expect(page.getByText('نعمل على إضافة عرض قرآني إشاري من مصدر موثوق ومصرح باستخدامه.')).toBeVisible();
  await page.getByRole('tab', { name: 'صفحات المصحف' }).click();
  await expect(page.getByRole('link', { name: 'فتح المصدر الرسمي' })).toBeVisible();
});

test('official smart Quran loads all key Surah endpoints and search metadata', async ({ page }) => {
  await page.goto('/quran?view=smart');
  const selector = page.getByRole('combobox', { name: 'اختر سورة' });
  await expect(selector).toBeVisible();
  for (const value of ['2', '112', '114'] as const) {
    await selector.selectOption(value);
    await expect(selector).toHaveValue(value);
    await expect(page.locator('.smart-ayah-card').first()).toBeVisible();
  }
  const QuranSearch = page.getByRole('textbox', { name: 'ابحث في القرآن' });
  await QuranSearch.fill('بسم الله');
  await expect(page.getByText(/نتائج البحث:/)).toBeVisible();
  await expect(page.getByText(/الجزء 1/).first()).toBeVisible();
});

test('smart Quran ayah actions are contextual and do not claim unavailable content', async ({ page }) => {
  await page.goto('/quran?view=smart');
  await expect(page.getByRole('region', { name: 'التلاوة الصوتية' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'استمع للسورة' })).toBeVisible();
  await page.getByRole('combobox', { name: 'اختر سورة' }).selectOption('112');
  await page.locator('.smart-ayah-card').first().click();
  await expect(page.getByRole('dialog', { name: /خيارات الآية 1/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'حفظ الآية' })).toBeVisible();
  await page.getByRole('dialog', { name: /خيارات الآية 1/ }).getByRole('button', { name: 'ابدأ التسميع' }).click();
  await expect(page).toHaveURL(/\/practice\/ayah$/);
  await expect(page.getByText(/هدف التسميع:/)).toBeVisible();
  await page.goto('/quran?view=smart');
  await page.locator('.smart-ayah-card').first().click();
  await page.getByRole('button', { name: 'إغلاق خيارات الآية' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('local profile, accessibility settings, and saved references are usable', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'ملفي' })).toBeVisible();
  await page.getByRole('combobox', { name: 'حجم النص' }).selectOption('large');
  await page.getByLabel('تباين مرتفع').check();
  await page.goto('/quran?view=smart');
  await page.locator('.smart-ayah-card').first().click();
  await page.getByRole('button', { name: 'حفظ الآية' }).click();
  await page.goto('/saved');
  await expect(page.getByRole('heading', { name: 'المحفوظات' })).toBeVisible();
  await expect(page.getByText(/الآية 1/).first()).toBeVisible();
});

test('reading, practice, details, sources and sign access render without starting camera', async ({ page }) => {
  await page.goto('/surah/al-ikhlas');
  await expect(page.getByRole('heading', { name: 'الإخلاص' })).toBeVisible();
  await page.getByRole('button', { name: 'إخفاء النص', exact: true }).click();
  await page.getByRole('link', { name: /ابدأ المراجعة/ }).click();
  await expect(page.getByText('قبل البدء')).toBeVisible();
  await page.getByRole('button', { name: 'فهمت، ابدأ' }).click();
  await page.getByText('تفاصيل التعرّف').click();
  await expect(page.getByText('هذه التفاصيل تقنية')).toBeVisible();
  await page.goto('/sources');
  await expect(page.getByRole('heading', { name: 'المصادر والخصوصية' })).toBeVisible();
  await page.goto('/accessibility');
  await expect(page.getByRole('heading', { name: 'المصحف بالهجاء الإصبعي' })).toBeVisible();
});
