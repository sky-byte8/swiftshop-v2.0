import { expect, test } from '@playwright/test'

import { setupApiMocks } from './fixtures/api'
import { seedAuthenticatedSession } from './support'

test('账户余额支付成功后展示服务端确认的结果', async ({ page }) => {
  await seedAuthenticatedSession(page)
  const api = await setupApiMocks(page, { paymentOutcome: 'success' })

  await page.goto('/pay/9001')
  await expect(page.getByRole('heading', { name: '订单支付' })).toBeVisible()
  await page.getByPlaceholder('输入登录密码确认支付').fill('correct-password')
  await page.getByRole('button', { name: /^支付 / }).click()

  await expect(page).toHaveURL(/\/payment-result\/9001$/)
  await expect(page.getByRole('heading', { name: '支付成功' })).toBeVisible()
  await expect(page.getByText('支付成功', { exact: true }).first()).toBeVisible()
  expect(api.order.status).toBe(2)
  expect(api.payOrder.status).toBe(3)
  expect(api.calls.some((call) => call.method === 'POST' && call.path === '/pay-orders/99001')).toBe(true)
})

test('余额支付失败时保留收银台并展示后端错误', async ({ page }) => {
  await seedAuthenticatedSession(page)
  const api = await setupApiMocks(page, {
    orderId: '9002',
    paymentOutcome: 'failure',
  })

  await page.goto('/pay/9002')
  await page.getByPlaceholder('输入登录密码确认支付').fill('wrong-password')
  await page.getByRole('button', { name: /^支付 / }).click()

  await expect(page).toHaveURL(/\/pay\/9002$/)
  await expect(page.getByText('支付密码错误').first()).toBeVisible()
  expect(api.order.status).toBe(1)
  expect(api.payOrder.status).toBe(1)
  expect(api.calls.some((call) => call.method === 'POST' && call.path.startsWith('/pay-orders/'))).toBe(true)
})
