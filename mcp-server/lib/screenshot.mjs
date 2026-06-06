/**
 * Reliable page screenshots via Playwright (fixes Puppeteer MCP timeouts)
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_OUT = join(__dirname, '..', 'screenshots')

export async function takeScreenshot({
  url,
  name = 'screenshot',
  selector,
  width = 1280,
  height = 800,
  waitForSelector,
  waitMs = 1500,
  fullPage = false,
  outputDir = DEFAULT_OUT,
}) {
  // Windows: prefer localhost over 127.0.0.1 for Vite dev server
  const normalizedUrl = url.replace('127.0.0.1', 'localhost')

  await mkdir(outputDir, { recursive: true })
  const outPath = join(outputDir, `${name}.png`)

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  })

  try {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(60_000)
    page.setDefaultTimeout(30_000)

    await page.setViewportSize({ width, height })
    await page.goto(normalizedUrl, { waitUntil: 'networkidle', timeout: 60_000 })

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 30_000 })
    } else if (waitMs > 0) {
      await page.waitForTimeout(waitMs)
    }

    if (selector) {
      const el = page.locator(selector).first()
      await el.waitFor({ state: 'visible', timeout: 15_000 })
      await el.screenshot({ path: outPath })
    } else {
      await page.screenshot({ path: outPath, fullPage })
    }

    const buffer = await (await import('fs/promises')).readFile(outPath)
    return { path: outPath, buffer, width, height, url: normalizedUrl }
  } finally {
    await browser.close()
  }
}
