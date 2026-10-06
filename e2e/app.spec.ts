import { expect, test } from '@playwright/test';

async function openSmartText(page: import('@playwright/test').Page) {
  await page.goto('/quran?view=smart');
  await page.getByRole('tab', { name: 'النص الذكي' }).click();
}

test('home keeps Quran as the primary journey', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /رحلتك مع القرآن/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /افتح القرآن/ })).toBeVisible();
});

test('page reader starts visible and preserves geometry when hidden', async ({ page }) => {
  await page.goto('/quran');
  await expect(page.locator('.page-quran-paper .page-ayah-text').first()).toBeVisible();
  await page.getByRole('button', { name: 'إخفاء النص' }).click();
  await expect(page.getByRole('button', { name: 'إظهار النص' })).toBeVisible();
  await expect(page.locator('.page-mask').first()).toBeVisible();
  await page.getByRole('button', { name: 'إظهار النص' }).click();
  await expect(page.locator('.page-mask')).toHaveCount(0);
});

test('availability filters reflect actual audited support', async ({ page }) => {
  await openSmartText(page);
  await page.getByRole('button', { name: 'متاح بالكامل', exact: true }).click();
  await expect(page.getByText('متاح بالكامل').first()).toBeVisible();
  await page.getByRole('button', { name: 'متاح جزئيًا', exact: true }).click();
  await expect(page.getByText(/متاح جزئيًا/).first()).toBeVisible();
  await page.getByRole('button', { name: 'الكل' }).click();
  await expect(page.getByRole('button', { name: /112 الإخلاص/ })).toBeVisible();
});

test('page ayah starts inline sign recitation without route navigation', async ({ page }) => {
  await page.goto('/quran');
  await page.locator('.page-ayah-text').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  if (await dialog.getByRole('button', { name: 'سمّع بالإشارة هنا' }).count()) {
    await dialog.getByRole('button', { name: 'سمّع بالإشارة هنا' }).click();
    await expect(page).toHaveURL(/\/quran/);
    await expect(page.locator('.inline-camera-panel')).toBeVisible();
  }
});

test('smart text keeps detailed review navigation', async ({ page }) => {
  await openSmartText(page);
  await page.getByRole('combobox', { name: 'اختر سورة' }).selectOption('112');
  await page.locator('.reading-ayah-trigger').first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'ابدأ التسميع' }).click();
  await expect(page).toHaveURL(/\/practice\/ayah/);
});

test('more menu closes on outside interaction and Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'المزيد' }).first().click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await page.getByRole('button', { name: 'المزيد' }).first().click();
  await page.locator('main').click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole('menu')).toHaveCount(0);
});

test('library offers Mushaf Editions and Dhikr future card', async ({ page }) => {
  await page.goto('/library');
  await expect(page.getByRole('link', { name: /إصدارات المصحف/ })).toBeVisible();
  await expect(page.getByText('عداد الذكر')).toBeVisible();
  await expect(page.getByText('قريبًا').first()).toBeVisible();
});

test('primary flagship surfaces fit a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/quran', '/quran?view=smart', '/progress', '/profile', '/library']) {
    await page.goto(path);
    await expect(page.locator('.mobile-nav')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
});


test('desktop header keeps brand right, navigation centered, and More left', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const positions = await page.evaluate(() => {
    const box = (selector: string) => document.querySelector(selector)?.getBoundingClientRect();
    const brand = box('.brand'); const nav = box('.header-nav'); const more = box('.header-more');
    return { brand, nav, more, width: window.innerWidth, menuText: document.querySelector('.more-menu')?.textContent ?? '' };
  });
  expect(positions.brand).not.toBeNull();
  expect(positions.nav).not.toBeNull();
  expect(positions.more).not.toBeNull();
  expect(positions.brand!.right).toBeGreaterThan(positions.nav!.right);
  expect(positions.more!.left).toBeLessThan(positions.nav!.left);
  await page.getByRole('button', { name: 'المزيد' }).first().click();
  await expect(page.getByRole('menu')).not.toContainText('بياناتي');
  await expect(page.getByRole('menu')).not.toContainText('الوصول بالإشارة');
});


test('Progress page presents the Quran journey for a new user', async ({ page }) => {
  await page.goto('/progress');
  await expect(page.getByRole('heading', { name: /المرحلة الأولى/ })).toBeVisible();
  await expect(page.locator('.journey-map')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'مستوياتي في مسارات التعلم' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'إنجازاتك' })).toBeVisible();
  await expect(page.locator('.achievement-card.is-locked').first()).toBeVisible();
  await expect(page.locator('.header-nav a[aria-current="page"]')).toContainText('تقدمي');
});
