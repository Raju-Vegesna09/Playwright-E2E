import { test, expect } from '../../core/fixtures/base.fixture';

test.describe('Salesforce products journey @smoke', () => {
  test('user can land on Products page directly', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.assertProductsExperienceLoaded();
  });

  test('user can navigate from home to Sales Cloud product page', async ({ page, header }) => {
    await page.goto('/');
    await header.openProductsMenu();
    await header.productsLink('Sales Cloud').click();

    await expect(page).toHaveURL(/sales-cloud/i);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});
