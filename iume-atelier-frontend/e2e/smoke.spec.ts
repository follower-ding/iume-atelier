import { test, expect } from '@playwright/test'

test('health endpoint returns UP', async ({ request }) => {
  const response = await request.get('http://localhost:8080/api/health')
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(body.status).toBe('UP')
})
