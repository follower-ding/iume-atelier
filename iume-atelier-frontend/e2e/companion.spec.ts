import { test, expect } from '@playwright/test'

test('iu companion avatar is visible on homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.companion-dock')).toBeVisible()
  await expect(page.getByRole('button', { name: '个人陪伴头像' })).toBeVisible()
  await expect(page.locator('.companion-avatar__photo-shell')).toBeVisible()
})

test('companion shows quote on click', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '个人陪伴头像' }).click()
  await expect(page.locator('.companion-dock__bubble')).toBeVisible()
})

test('companion avatar can be dragged', async ({ page }) => {
  await page.goto('/')
  const dock = page.locator('.companion-dock')
  await expect(dock).toBeVisible()

  const boxBefore = await dock.boundingBox()
  expect(boxBefore).toBeTruthy()
  if (!boxBefore) return

  const startX = boxBefore.x + boxBefore.width / 2
  const startY = boxBefore.y + boxBefore.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX - 90, startY - 70, { steps: 12 })
  await page.mouse.up()

  await expect
    .poll(async () => {
      const boxAfter = await dock.boundingBox()
      if (!boxAfter) return 0
      return Math.abs(boxAfter.x - boxBefore.x) + Math.abs(boxAfter.y - boxBefore.y)
    })
    .toBeGreaterThan(20)
})

test('music player opens from companion toolbar', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '音乐' }).click()
  const panel = page.getByRole('dialog', { name: '音乐' })
  await expect(panel).toBeVisible()
  await expect(panel.locator('.companion-music__track')).toHaveText('雨声白噪音')
})

test('music keeps playing after panel is collapsed', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '音乐' }).click()
  const panel = page.getByRole('dialog', { name: '音乐' })
  await panel.getByRole('button', { name: '播放' }).click()
  await expect(page.locator('.companion-dock--playing')).toBeVisible()
  await panel.getByRole('button', { name: '收起，继续播放' }).click()
  await expect(panel).not.toBeVisible()
  await expect(page.locator('.companion-dock--playing')).toBeVisible()
  await page.getByRole('button', { name: '暂停' }).click()
  await expect(page.locator('.companion-dock--playing')).not.toBeVisible()
})
