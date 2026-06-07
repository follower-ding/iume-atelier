import { test, expect } from '@playwright/test'

test.describe('Mobile navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
  })

  test('bottom nav shows main tabs', async ({ page }) => {
    await page.goto('/')
    const bottomNav = page.getByRole('navigation', { name: '底部导航' })
    await expect(bottomNav).toBeVisible()
    await expect(bottomNav.getByRole('link', { name: '首页' })).toBeVisible()
    await expect(bottomNav.getByRole('link', { name: '文章' })).toBeVisible()
    await expect(bottomNav.getByRole('link', { name: '工具' })).toBeVisible()
    await expect(bottomNav.getByRole('link', { name: '项目' })).toBeVisible()
  })

  test('more menu opens with search link', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: '底部导航' }).getByRole('button', { name: '打开菜单' }).click()
    const dialog = page.getByRole('dialog', { name: '打开菜单' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: '搜索' })).toBeVisible()
    await expect(dialog.getByRole('link', { name: '关于' })).toBeVisible()
  })

  test('bottom nav navigates to tools page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: '底部导航' }).getByRole('link', { name: '工具' }).click()
    await expect(page).toHaveURL(/\/tools/)
    await expect(page.getByRole('heading', { name: /AI 工具箱/i })).toBeVisible()
  })
})
