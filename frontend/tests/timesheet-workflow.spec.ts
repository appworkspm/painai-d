import { test, expect } from '@playwright/test';

const baseUrl = 'https://painai.onrender.com';
const users = {
  admin: { email: 'jakgrits.ph@appworks.co.th', password: 'password123' },
  manager: { email: 'pratya.fu@appworks.co.th', password: 'password123' },
  user: { email: 'nawin.bu@appworks.co.th', password: 'password123' },
};

function getRandomActivity() {
  return 'E2E_TEST_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomDate() {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 10));
  return d.toISOString().split('T')[0];
}

test('Timesheet workflow end-to-end', async ({ page }) => {
  // 1. Login as USER
  await page.goto(`${baseUrl}/login`);
  await page.fill('input[name="email"]', users.user.email);
  await page.fill('input[name="password"]', users.user.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);

  // 2. Create new timesheet
  await page.goto(`${baseUrl}/timesheets/create`);
  const activity = getRandomActivity();
  const date = getRandomDate();
  await page.fill('input[name="activity"]', activity);
  await page.fill('input[name="hours_worked"]', '2');
  await page.fill('input[name="date"]', date);
  await page.fill('textarea[name="description"]', 'E2E automated test');
  // เลือก work_type/project ถ้ามี dropdown (อาจต้องปรับ selector ตาม UI จริง)
  await page.click('button[type="submit"]');
  await expect(page.locator('text=สร้าง Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });

  // 3. Submit timesheet (ไปหน้า My Timesheet แล้ว submit ใบล่าสุด)
  await page.goto(`${baseUrl}/my-timesheets`);
  await page.locator(`text=${activity}`).first().click();
  await page.click('button:has-text("ส่งอนุมัติ")');
  await expect(page.locator('text=ส่ง Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });

  // 4. Logout USER
  await page.click('button:has-text("ออกจากระบบ")');

  // 5. Login as MANAGER
  await page.goto(`${baseUrl}/login`);
  await page.fill('input[name="email"]', users.manager.email);
  await page.fill('input[name="password"]', users.manager.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);

  // 6. Approve timesheet (ไปหน้าอนุมัติ ค้นหา activity แล้วอนุมัติ)
  await page.goto(`${baseUrl}/timesheets/approval`);
  await page.locator(`text=${activity}`).first().click();
  await page.click('button:has-text("อนุมัติ")');
  await expect(page.locator('text=อนุมัติ Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });

  // 7. Logout MANAGER
  await page.click('button:has-text("ออกจากระบบ")');

  // 8. Login as USER ตรวจสอบสถานะ
  await page.goto(`${baseUrl}/login`);
  await page.fill('input[name="email"]', users.user.email);
  await page.fill('input[name="password"]', users.user.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
  await page.goto(`${baseUrl}/my-timesheets`);
  await expect(page.locator(`text=${activity}`)).toBeVisible();
  await expect(page.locator('text=อนุมัติแล้ว')).toBeVisible();
}); 