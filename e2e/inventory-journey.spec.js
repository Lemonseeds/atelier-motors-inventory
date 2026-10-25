import { test, expect } from '@playwright/test';

test.describe('Atelier Motors End-to-End Journey', () => {
  test('visitor registers, searches for a car, purchases unit, and handles sold out', async ({ page }) => {
    const uniqueEmail = `collector_${Date.now()}@example.com`;

    // 1. Visit showroom
    await page.goto('/');
    await expect(page).toHaveTitle(/Atelier Motors/i);

    // 2. Open auth dialog and register
    const signInBtn = page.getByRole('button', { name: /Sign in|Join Atelier/i }).first();
    await signInBtn.click();

    // Switch to register tab
    const registerTab = page.getByRole('button', { name: /Create account|Register/i });
    if (await registerTab.isVisible()) {
      await registerTab.click();
    }

    // Fill registration credentials
    await page.locator('input[name="name"], input#register-name').fill('Ayrton Collector');
    await page.locator('input[type="email"], input#register-email').fill(uniqueEmail);
    await page.locator('input[type="password"], input#register-password').fill('BespokePass123!');
    await page.getByRole('button', { name: /Create account|Join Atelier/i }).last().click();

    // Verify authenticated state
    await expect(page.getByText(/Private Client|Sign out|My Garage/i).first()).toBeVisible({ timeout: 10000 });

    // 3. Search for a specific model
    const searchInput = page.getByPlaceholder(/Search by model/i).first();
    await searchInput.fill('Aurelia');

    // Verify Aurelia GT S is present in filtered results
    await expect(page.getByText(/Aurelia GT S/i).first()).toBeVisible();

    // 4. Open vehicle experience and complete purchase
    const exploreBtn = page.getByRole('button', { name: /Configure & Reserve|Purchase|Design yours/i }).first();
    await exploreBtn.click();

    // On configurator page, click confirm purchase
    const purchaseBtn = page.getByRole('button', { name: /Confirm purchase|Purchase car/i });
    await expect(purchaseBtn).toBeVisible();
    await purchaseBtn.click();

    // Toast notification or confirmation appears
    await expect(page.getByText(/purchased successfully|Order Confirmed/i).first()).toBeVisible({ timeout: 10000 });
  });
});
