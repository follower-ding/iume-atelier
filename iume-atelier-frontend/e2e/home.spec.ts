import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/iume atelier/)
  await expect(page.getByRole('link', { name: 'iume·atelier' })).toBeVisible()
})

test('404 page shows for unknown route', async ({ page }) => {
  await page.goto('/this-page-does-not-exist')
  await expect(page.getByRole('heading', { name: '页面不存在' })).toBeVisible()
})
