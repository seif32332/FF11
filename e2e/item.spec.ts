import { test, expect } from "@playwright/test";

test.describe("Item Management", () => {
    test.beforeEach(async ({ page }) => {
        // Login and navigate to a board
        await page.goto("/login");
        await page.getByPlaceholder("البريد الإلكتروني").fill("test@example.com");
        await page.getByPlaceholder("كلمة المرور").fill("password123");
        await page.getByRole("button", { name: /تسجيل الدخول/ }).click();
        await page.waitForURL("/dashboard");

        // Navigate to first board
        await page.getByRole("link", { name: /لوحة/ }).first().click();
        await page.waitForURL(/\/dashboard\/board\//);
    });

    test("should display items in board", async ({ page }) => {
        await expect(page.locator("tbody tr").first()).toBeVisible();
    });

    test("should add new item to group", async ({ page }) => {
        const itemName = `عنصر جديد ${Date.now()}`;

        // Click add item button
        await page.getByRole("button", { name: /إضافة عنصر/ }).first().click();

        // Fill item name
        await page.getByPlaceholder("اسم العنصر").fill(itemName);
        await page.keyboard.press("Enter");

        // Verify item was created
        await expect(page.getByText(itemName)).toBeVisible();
    });

    test("should edit item inline", async ({ page }) => {
        const updatedName = `عنصر محدث ${Date.now()}`;

        // Double click on item name to edit
        await page.locator("td").filter({ hasText: /عنصر/ }).first().dblclick();

        // Clear and type new name
        await page.getByRole("textbox").fill(updatedName);
        await page.keyboard.press("Enter");

        // Verify item was updated
        await expect(page.getByText(updatedName)).toBeVisible();
    });

    test("should change item status", async ({ page }) => {
        // Click on status cell
        await page.locator("[data-column-type='STATUS']").first().click();

        // Select a new status
        await page.getByText("مكتمل").click();

        // Verify status changed
        await expect(page.locator("[data-column-type='STATUS']").first()).toContainText("مكتمل");
    });

    test("should set item date", async ({ page }) => {
        // Click on date cell
        await page.locator("[data-column-type='DATE']").first().click();

        // Click on a date in calendar (today)
        await page.getByRole("button", { name: /today|اليوم/ }).click();

        // Verify date was set
        await expect(page.locator("[data-column-type='DATE']").first()).not.toBeEmpty();
    });

    test("should delete item", async ({ page }) => {
        // Right click on item row to open context menu
        await page.locator("tbody tr").first().click({ button: "right" });

        // Click delete option
        await page.getByRole("menuitem", { name: /حذف/ }).click();

        // Confirm deletion
        await page.getByRole("button", { name: /تأكيد/ }).click();
    });

    test("should drag and drop items", async ({ page }) => {
        const firstItem = page.locator("tbody tr").first();
        const secondItem = page.locator("tbody tr").nth(1);

        // Get initial positions
        const firstBox = await firstItem.boundingBox();
        const secondBox = await secondItem.boundingBox();

        if (firstBox && secondBox) {
            // Drag first item to second position
            await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height / 2);
            await page.mouse.up();
        }
    });

    test("should open item detail panel", async ({ page }) => {
        // Click on item name
        await page.locator("td").filter({ hasText: /عنصر/ }).first().click();

        // Detail panel should open
        await expect(page.getByText("تفاصيل العنصر")).toBeVisible();
    });
});
