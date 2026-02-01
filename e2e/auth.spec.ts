import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
    test("should display login page", async ({ page }) => {
        await page.goto("/login");

        // Check Arabic content
        await expect(page.getByText("تسجيل الدخول")).toBeVisible();
        await expect(page.getByPlaceholder("البريد الإلكتروني")).toBeVisible();
        await expect(page.getByPlaceholder("كلمة المرور")).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
        await page.goto("/login");

        await page.getByRole("button", { name: /تسجيل الدخول/ }).click();

        // Expect validation error for empty fields
        await expect(page.getByText(/مطلوب/)).toBeVisible();
    });

    test("should redirect to dashboard after successful login", async ({ page }) => {
        await page.goto("/login");

        // Fill login form with test credentials
        await page.getByPlaceholder("البريد الإلكتروني").fill("test@example.com");
        await page.getByPlaceholder("كلمة المرور").fill("password123");

        await page.getByRole("button", { name: /تسجيل الدخول/ }).click();

        // Wait for redirect to dashboard
        await page.waitForURL("/dashboard");
        await expect(page).toHaveURL(/dashboard/);
    });

    test("should display register page", async ({ page }) => {
        await page.goto("/register");

        await expect(page.getByText("إنشاء حساب")).toBeVisible();
        await expect(page.getByPlaceholder("الاسم الكامل")).toBeVisible();
        await expect(page.getByPlaceholder("البريد الإلكتروني")).toBeVisible();
        await expect(page.getByPlaceholder("كلمة المرور")).toBeVisible();
    });

    test("should navigate between login and register pages", async ({ page }) => {
        await page.goto("/login");

        await page.getByRole("link", { name: /إنشاء حساب/ }).click();
        await expect(page).toHaveURL(/register/);

        await page.getByRole("link", { name: /تسجيل الدخول/ }).click();
        await expect(page).toHaveURL(/login/);
    });
});
