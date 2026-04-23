import { test, expect } from '../../core/fixtures/base.fixture';

test.describe('Salesforce products content @regression', () => {
  test('products page has key product links for major suites', async ({ page, productsPage }) => {
    await productsPage.goto();

    const expectedProducts = ['Sales Cloud', 'Service Cloud', 'Marketing Cloud'];

    for (const productName of expectedProducts) {
      await expect(page.getByRole('link', { name: new RegExp(productName, 'i') }).first()).toBeVisible();
    }
  });

  test('product link opens product destination page', async ({ page, productsPage }) => {
    await productsPage.goto();
    await productsPage.openProductCardByName('Service Cloud');

    await expect(page).toHaveURL(/service-cloud/i);
  });
});
