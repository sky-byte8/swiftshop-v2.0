import { expect, type Page } from '@playwright/test'

interface SessionUser {
  userId: string
  username: string
  balance: number
}

export async function seedAuthenticatedSession(
  page: Page,
  user: SessionUser = {
    userId: '301',
    username: 'e2e-user',
    balance: 500000,
  },
): Promise<void> {
  await page.addInitScript((sessionUser) => {
    window.sessionStorage.setItem('token', 'mock-token')
    window.sessionStorage.setItem('user-info', JSON.stringify(sessionUser))
  }, user)
}

export async function expectHealthyPage(page: Page): Promise<void> {
  await expect(page.locator('#app')).toBeVisible()
  await expect(page.locator('h1').first()).toBeVisible()

  const metrics = await page.evaluate(() => ({
    bodyTextLength: document.body.innerText.trim().length,
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }))

  expect(metrics.bodyTextLength, '页面应包含可见内容').toBeGreaterThan(20)
  expect(
    metrics.scrollWidth,
    `页面出现横向溢出：scrollWidth=${metrics.scrollWidth}, viewportWidth=${metrics.viewportWidth}`,
  ).toBeLessThanOrEqual(metrics.viewportWidth)
}
