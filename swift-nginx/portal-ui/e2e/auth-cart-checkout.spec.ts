import { expect, test } from '@playwright/test'

import { setupApiMocks } from './fixtures/api'
import { seedAuthenticatedSession } from './support'

test('受保护页面登录后返回原购物袋', async ({ page }) => {
  const api = await setupApiMocks(page)

  await page.goto('/cart')
  await expect(page).toHaveURL(/\/login\?redirect=/)
  await expect.poll(() => new URL(page.url()).searchParams.get('redirect')).toBe('/cart')

  await page.getByPlaceholder('请输入用户名').fill('swift-user')
  await page.getByPlaceholder('请输入密码').fill('correct-password')
  await page.locator('form.login-form').getByRole('button', { name: '登录', exact: true }).click()

  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByRole('heading', { name: '购物袋' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Aura 无线降噪耳机' })).toBeVisible()
  await expect.poll(() => api.calls.some((call) => call.method === 'POST' && call.path === '/users/login')).toBe(true)

  const session = await page.evaluate(() => ({
    token: window.sessionStorage.getItem('token'),
    returnUrl: window.sessionStorage.getItem('return-url'),
  }))
  expect(session).toEqual({ token: 'mock-token', returnUrl: null })
})

test('购物袋可更新数量，结算时没有地址会阻断下单', async ({ page }) => {
  await seedAuthenticatedSession(page)
  const api = await setupApiMocks(page, { addresses: [] })

  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Aura 无线降噪耳机' })).toBeVisible()
  await page.getByRole('button', { name: '增加数量' }).click()
  await expect(page.getByLabel('数量 2')).toBeVisible()
  await expect.poll(() => api.cartItems[0]?.num).toBe(2)

  await page.getByRole('button', { name: /前往结算/ }).click()
  await expect(page).toHaveURL(/\/checkout\?ids=501$/)
  await expect(page.getByRole('heading', { name: '确认订单' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '没有可用的收货地址' })).toBeVisible()
  await expect(page.getByRole('button', { name: /提交订单/ })).toBeDisabled()
  expect(api.calls.some((call) => call.method === 'POST' && call.path === '/orders')).toBe(false)
})
