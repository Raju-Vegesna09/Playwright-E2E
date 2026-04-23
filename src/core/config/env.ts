export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://www.salesforce.com/in/',
  defaultTimeoutMs: Number(process.env.DEFAULT_TIMEOUT_MS ?? 30_000),
  expectTimeoutMs: Number(process.env.EXPECT_TIMEOUT_MS ?? 10_000)
};
