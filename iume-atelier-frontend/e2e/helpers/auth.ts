import { type Page, expect } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('用户名').fill('admin')
  await page.getByPlaceholder('密码').fill('admin123')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).toHaveURL(/\/console/)
}

export async function deleteUserByApi(page: Page, username: string) {
  const loginRes = await page.request.post('http://localhost:8080/api/auth/login', {
    data: { username: 'admin', password: 'admin123' },
  })
  const loginBody = await loginRes.json()
  const token = loginBody.data.token as string

  const usersRes = await page.request.get('http://localhost:8080/api/admin/users?page=1&size=50&keyword=' + username, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const usersBody = await usersRes.json()
  const user = usersBody.data.records.find((u: { username: string }) => u.username === username)
  if (user) {
    await page.request.delete(`http://localhost:8080/api/admin/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }
}
