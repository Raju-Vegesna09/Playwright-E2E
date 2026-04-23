import { expect, type Locator, type Page } from 'playwright/test';

export class HeaderComponent {
  readonly productsMenuTrigger: Locator;

  constructor(private readonly page: Page) {
    this.productsMenuTrigger = page.getByRole('button', { name: /products/i }).first();
  }

  async openProductsMenu(): Promise<void> {
    await this.productsMenuTrigger.click();
    await expect(this.page.getByRole('navigation')).toBeVisible();
  }

  productsLink(productName: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(productName, 'i') }).first();
  }
}
