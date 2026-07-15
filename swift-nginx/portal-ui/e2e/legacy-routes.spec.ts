import { expect, test } from '@playwright/test'

import { setupApiMocks } from './fixtures/api'
import { seedAuthenticatedSession } from './support'

test('旧静态页面地址保留查询参数并重定向到 SPA 路由', async ({ page }) => {
  await seedAuthenticatedSession(page)
  await setupApiMocks(page)

  await page.goto('/search.html?key=Aura&sortBy=price#selection')
  await expect(page).toHaveURL(/\/search\?key=Aura&sortBy=price#selection$/)
  await expect(page.getByRole('heading', { name: '“Aura” 的搜索结果' })).toBeVisible()

  await page.goto('/pay.html?id=9001&from=legacy')
  await expect(page).toHaveURL(/\/pay\/9001\?id=9001&from=legacy$/)
  await expect(page.getByRole('heading', { name: '订单支付' })).toBeVisible()

  await page.goto('/paysuccess.html?orderId=9001&from=legacy')
  await expect(page).toHaveURL(/\/payment-result\/9001\?orderId=9001&from=legacy$/)
  await expect(page.getByRole('heading', { name: '等待支付' })).toBeVisible()
})
