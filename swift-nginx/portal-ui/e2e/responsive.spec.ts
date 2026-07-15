import { expect, test } from '@playwright/test'

import { setupApiMocks } from './fixtures/api'
import { expectHealthyPage, seedAuthenticatedSession } from './support'

test('桌面与手机视口的关键页面非空且无横向溢出', async ({ page }, testInfo) => {
  await seedAuthenticatedSession(page)
  await setupApiMocks(page)

  const expectedViewport = testInfo.project.name === 'mobile-chromium'
    ? { width: 390, height: 844 }
    : { width: 1440, height: 900 }
  expect(page.viewportSize()).toEqual(expectedViewport)

  const routes = [
    '/',
    '/home',
    '/search?key=Aura',
    '/product/1001',
    '/login',
    '/cart',
    '/checkout?ids=501',
    '/pay/9001',
    '/payment-result/9001',
  ]

  for (const route of routes) {
    await test.step(route, async () => {
      await page.goto(route)
      await expectHealthyPage(page)
    })
  }
})
