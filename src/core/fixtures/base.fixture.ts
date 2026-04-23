import { test as base, expect } from 'playwright/test';
import { ProductsPage } from '../../pages/products.page';
import { HeaderComponent } from '../../components/header.component';

type UiFixtures = {
  productsPage: ProductsPage;
  header: HeaderComponent;
};

export const test = base.extend<UiFixtures>({
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  }
});

export { expect };
