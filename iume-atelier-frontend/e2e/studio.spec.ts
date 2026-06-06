import { test, expect } from '@playwright/test'

test('studio page loads for logged-in user', async ({ page }) => {
  const username = `studio_e2e_${Date.now()}`
  const password = 'test123456'

  await page.request.post('http://localhost:8080/api/auth/register', {
    data: { username, password, email: `${username}@test.com`, nickname: 'Studio Test' },
  })

  await page.goto('/login')
  await page.getByPlaceholder('用户名').fill(username)
  await page.getByPlaceholder('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).toHaveURL('/')

  await page.goto('/studio')
  await expect(page.getByRole('heading', { name: '写作台' })).toBeVisible()
  await expect(page.getByText('加载中…')).not.toBeVisible({ timeout: 15000 })
  await expect(page.getByText('还没有文章，开始写第一篇吧')).toBeVisible()

  await page.goto('/studio/new')
  await expect(page.getByPlaceholder('文章标题')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Markdown 编写')).toBeVisible()
})
