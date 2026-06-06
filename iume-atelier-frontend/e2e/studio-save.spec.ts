import { test, expect } from '@playwright/test'

test('studio save draft works', async ({ page }) => {
  const username = `studio_save_${Date.now()}`
  const password = 'test123456'

  await page.request.post('http://localhost:8080/api/auth/register', {
    data: { username, password, email: `${username}@test.com`, nickname: 'Save Test' },
  })

  await page.goto('/login')
  await page.getByPlaceholder('用户名').fill(username)
  await page.getByPlaceholder('密码').fill(password)
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 })

  await page.goto('/studio/new')
  await page.getByPlaceholder('文章标题').fill('Test Article')
  await page.locator('.tech-editor__textarea').fill('# Hello\n\nSome content here')
  await page.getByRole('button', { name: '保存草稿' }).click()
  await expect(page).toHaveURL('/studio', { timeout: 10000 })
  await expect(page.getByText('Test Article')).toBeVisible()
})
