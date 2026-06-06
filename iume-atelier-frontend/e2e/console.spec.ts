import { test, expect } from '@playwright/test'
import { deleteUserByApi, loginAsAdmin } from './helpers/auth'

test.describe('Admin Console', () => {
  test('admin login redirects to console dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByTestId('console-dashboard-title')).toBeVisible()
    await expect(page.getByTestId('console-stat-grid')).toBeVisible()
  })

  test('dashboard shows trend charts', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByText('近 7 日趋势')).toBeVisible()
    await expect(page.getByTestId('console-trend-chart')).toHaveCount(3)
  })

  test('navigate to users and create user', async ({ page }) => {
    const username = `e2e_user_${Date.now()}`
    await loginAsAdmin(page)

    await page.getByRole('link', { name: '用户管理' }).click()
    await expect(page).toHaveURL(/\/console\/users/)
    await expect(page.getByTestId('console-users-table')).toBeVisible()

    await page.getByTestId('console-create-user-btn').click()
    await expect(page.getByTestId('console-create-user-modal')).toBeVisible()

    await page.getByTestId('console-create-username').fill(username)
    await page.getByTestId('console-create-password').fill('test123456')
    await page.getByTestId('console-create-email').fill(`${username}@test.com`)
    await page.getByTestId('console-create-nickname').fill('E2E Test User')
    await page.getByTestId('console-create-submit').click()

    await expect(page.getByTestId('console-create-user-modal')).not.toBeVisible()
    await expect(page.getByTestId('console-users-table')).toContainText(username)

    await deleteUserByApi(page, username)
  })

  test('audit logs page loads', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('link', { name: '操作日志' }).click()
    await expect(page).toHaveURL(/\/console\/audit-logs/)
    await expect(page.getByTestId('console-audit-table')).toBeVisible()
  })

  test('non-admin cannot access console', async ({ page }) => {
    const username = `e2e_nonadmin_${Date.now()}`
    await deleteUserByApi(page, username)

    const loginRes = await page.request.post('http://localhost:8080/api/auth/login', {
      data: { username: 'admin', password: 'admin123' },
    })
    const token = (await loginRes.json()).data.token as string
    const createRes = await page.request.post('http://localhost:8080/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        username,
        password: 'test123456',
        email: `${username}@test.com`,
        nickname: 'Non Admin',
        role: 'USER',
      },
    })
    expect(createRes.ok()).toBeTruthy()

    await page.goto('/login')
    await page.getByPlaceholder('用户名').fill(username)
    await page.getByPlaceholder('密码').fill('test123456')
    await page.getByRole('button', { name: '登录' }).click()
    await expect(page).toHaveURL('/', { timeout: 10000 })

    await page.goto('/console')
    await expect(page.getByRole('heading', { name: '无权访问' })).toBeVisible({ timeout: 10000 })

    await deleteUserByApi(page, username)
  })
})
