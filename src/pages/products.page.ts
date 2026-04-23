import { expect, type Locator, type Page } from '@playwright/test';

export class ProductsPage {
  readonly heading: Locator;
  readonly pageBody: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /products/i }).first();
    this.pageBody = page.locator('body');
  }

  async goto(): Promise<void> {
    await this.page.goto('/products/');
    await expect(this.page).toHaveURL(/\/products\//);
  }

  async assertProductsExperienceLoaded(): Promise<void> {
    await expect(this.pageBody).toContainText(/product|platform|crm/i);
  }

  async openProductCardByName(productName: string): Promise<void> {
    const link = this.page
      .getByRole('link')
      .filter({ hasText: new RegExp(productName, 'i') })
      .first();

    await expect(link).toBeVisible();
    await link.click();
  }
}
