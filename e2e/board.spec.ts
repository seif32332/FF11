import { test, expect } from "@playwright/test";

test.describe("Board CRUD Operations", () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto("/login");
        await page.getByPlaceholder("البريد الإلكتروني").fill("test@example.com");
        await page.getByPlaceholder("كلمة المرور").fill("password123");
        await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
        await page.waitForURL("/dashboard");
    });

    test("should display dashboard with boards", async ({ page }) => {
        await expect(page.getByText("اللوحات الحديثة")).toBeVisible();
    });

    test("should open create board modal", async ({ page }) => {
        await page.getByRole("button", { name: /إنشاء لوحة جديدة/ }).click();

        await expect(page.getByText("إنشاء لوحة جديدة")).toBeVisible();
        await expect(page.getByPlaceholder("اسم اللوحة")).toBeVisible();
    });

    test("should create a new board", async ({ page }) => {
        const boardName = `لوحة اختبار ${Date.now()}`;

        await page.getByRole("button", { name: /إنشاء لوحة جديدة/ }).click();
        await page.getByPlaceholder("اسم اللوحة").fill(boardName);
        await page.getByRole("button", { name: /إنشاء/ }).click();

        // Should be redirected to the new board
        await page.waitForURL(/\/dashboard\/board\//);
        await expect(page.getByText(boardName)).toBeVisible();
    });

    test("should navigate to board and display columns", async ({ page }) => {
        // Click on a board link
        await page.getByRole("link", { name: /لوحة/ }).first().click();

        await page.waitForURL(/\/dashboard\/board\//);

        // Check for column headers
        await expect(page.locator("th").first()).toBeVisible();
    });

    test("should open column settings modal", async ({ page }) => {
        await page.getByRole("link", { name: /لوحة/ }).first().click();
        await page.waitForURL(/\/dashboard\/board\//);

        // Click settings icon on column header
        await page.locator("th button").first().click();

        // Modal should appear
        await expect(page.getByText("إعدادات العمود")).toBeVisible();
    });

    test("should delete a board", async ({ page }) => {
        // Navigate to a board
        await page.getByRole("link", { name: /لوحة/ }).first().click();
        await page.waitForURL(/\/dashboard\/board\//);

        // Click more options and delete
        await page.getByRole("button", { name: /المزيد/ }).click();
        await page.getByRole("button", { name: /حذف اللوحة/ }).click();

        // Confirm deletion
        await page.getByRole("button", { name: /تأكيد الحذف/ }).click();

        // Should redirect to dashboard
        await page.waitForURL("/dashboard");
    });
});
