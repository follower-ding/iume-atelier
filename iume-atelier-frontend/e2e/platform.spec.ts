import { test, expect } from '@playwright/test'

test.describe('Platform features', () => {
  test('series list page loads', async ({ page }) => {
    await page.goto('/series')
    await expect(page.getByRole('heading', { name: '专题系列' })).toBeVisible()
  })

  test('newsletter form visible in footer', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByLabel('邮件订阅')).toBeVisible()
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
  })

  test('home quick links visible', async ({ page }) => {
    await page.goto('/')
    const quickLinks = page.locator('.home-quick-links')
    await expect(quickLinks.getByRole('link', { name: '最新文章' })).toBeVisible()
    await expect(quickLinks.getByRole('link', { name: 'AI 工具箱' })).toBeVisible()
    await expect(quickLinks.getByRole('link', { name: '搜索' })).toBeVisible()
  })
})
