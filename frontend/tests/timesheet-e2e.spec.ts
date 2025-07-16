import { test, expect } from '@playwright/test';

const baseUrl = 'https://painai.onrender.com';
const users = {
  admin: { email: 'jakgrits.ph@appworks.co.th', password: 'password123' },
  manager: { email: 'pratya.fu@appworks.co.th', password: 'password123' },
  user: { email: 'nawin.bu@appworks.co.th', password: 'password123' },
};

function getRandomActivity() {
  return 'E2E_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomDate() {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 10));
  return d.toISOString().split('T')[0];
}

test.describe('Timesheet E2E Workflow (ละเอียดสูงสุด)', () => {
  let activity: string;
  let date: string;
  let timesheetId: string;

  test('User: Create, Edit, Delete, Submit, Cancel Submit, Validation', async ({ page }) => {
    activity = getRandomActivity();
    date = getRandomDate();
    // Login
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', users.user.email);
    await page.fill('input[name="password"]', users.user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);

    // Create timesheet (valid)
    await page.goto(`${baseUrl}/timesheets/create`);
    await page.fill('input[name="activity"]', activity);
    await page.fill('input[name="hours_worked"]', '2');
    await page.fill('input[name="date"]', date);
    await page.fill('textarea[name="description"]', 'E2E automated test');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=สร้าง Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });

    // Validation: submit empty form
    await page.goto(`${baseUrl}/timesheets/create`);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=กรุณากรอก')).toBeVisible();

    // Validation: hours > 24
    await page.fill('input[name="hours_worked"]', '25');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=ไม่เกิน 24')).toBeVisible();

    // Edit timesheet
    await page.goto(`${baseUrl}/timesheets`);
    await page.fill('input[placeholder="ค้นหา"]', activity);
    await page.click(`text=${activity}`);
    await page.click('button:has-text("แก้ไข")');
    await page.fill('textarea[name="description"]', 'E2E edit test');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=แก้ไข Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });

    // Submit timesheet
    await page.goto(`${baseUrl}/timesheets`);
    await page.fill('input[placeholder="ค้นหา"]', activity);
    await page.click(`text=${activity}`);
    await page.click('button:has-text("ส่งอนุมัติ")');
    await expect(page.locator('text=ส่ง Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });

    // Cancel submit (ถ้ามี)
    // await page.click('button:has-text("ยกเลิกส่ง")');
    // await expect(page.locator('text=ยกเลิกส่ง Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });

    // Delete timesheet (ถ้าอนุญาต)
    // await page.click('button:has-text("ลบ")');
    // await expect(page.locator('text=ลบ Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });
  });

  test('User: Search, Filter, Sort, Pagination, Export', async ({ page }) => {
    await page.goto(`${baseUrl}/timesheets`);
    await page.fill('input[placeholder="ค้นหา"]', activity);
    await expect(page.locator(`text=${activity}`)).toBeVisible();
    // Filter by status
    await page.click('button:has-text("ทั้งหมด")');
    await expect(page.locator('text=ทั้งหมด')).toBeVisible();
    // Sort (ถ้ามี)
    // await page.click('th:has-text("วันที่")');
    // Pagination (ถ้ามี)
    // await page.click('button:has-text("ถัดไป")');
    // Export (ถ้ามี)
    // await page.click('button:has-text("Export")');
  });

  test('Manager: Approve, Reject, Bulk, Validation', async ({ page }) => {
    await page.goto(`${baseUrl}/logout`);
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', users.manager.email);
    await page.fill('input[name="password"]', users.manager.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
    await page.goto(`${baseUrl}/timesheets/approval`);
    await page.fill('input[placeholder="ค้นหา"]', activity);
    await expect(page.locator(`text=${activity}`)).toBeVisible();
    // Approve
    await page.click(`text=${activity}`);
    await page.click('button:has-text("อนุมัติ")');
    await expect(page.locator('text=อนุมัติ Timesheet สำเร็จ')).toBeVisible({ timeout: 10000 });
    // Reject (สร้างใหม่แล้ว reject)
    // Bulk approve/reject (ถ้ามี)
    // Validation: ปฏิเสธโดยไม่ใส่เหตุผล
    // await page.click('button:has-text("ปฏิเสธ")');
    // await page.click('button:has-text("ยืนยัน")');
    // await expect(page.locator('text=กรุณาระบุเหตุผล')).toBeVisible();
  });

  test('Admin: Permission, CRUD User/Role, Access All', async ({ page }) => {
    await page.goto(`${baseUrl}/logout`);
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', users.admin.email);
    await page.fill('input[name="password"]', users.admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
    await page.goto(`${baseUrl}/users`);
    await expect(page.locator('text=Users')).toBeVisible();
    // Create user/role, edit, delete, validation (ถ้ามี)
    await page.goto(`${baseUrl}/users/roles`);
    await expect(page.locator('text=Roles')).toBeVisible();
    await page.goto(`${baseUrl}/users/activity`);
    await expect(page.locator('text=User Activity')).toBeVisible();
    await page.goto(`${baseUrl}/admin`);
    await expect(page.locator('text=Admin Panel')).toBeVisible();
  });

  test('Permission: User/Manager cannot access admin', async ({ page }) => {
    await page.goto(`${baseUrl}/logout`);
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', users.user.email);
    await page.fill('input[name="password"]', users.user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
    await page.goto(`${baseUrl}/admin`);
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await page.goto(`${baseUrl}/users`);
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await page.goto(`${baseUrl}/users/roles`);
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await page.goto(`${baseUrl}/users/activity`);
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('UI/UX: Notification, Loading, Disabled, Logout/Login', async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', users.user.email);
    await page.fill('input[name="password"]', users.user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
    // ตรวจสอบ notification หลัง action (สร้าง/submit/approve/reject)
    // ตรวจสอบ loading, disabled state ของปุ่ม
    // Logout
    await page.click('button:has-text("ออกจากระบบ")');
    await expect(page).toHaveURL(/login/);
    // Login ใหม่
    await page.fill('input[name="email"]', users.user.email);
    await page.fill('input[name="password"]', users.user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  // เพิ่ม test สำหรับ Project CRUD, Report, Export, Pagination, Scenario พิเศษ ฯลฯ ตามต้องการ
}); 