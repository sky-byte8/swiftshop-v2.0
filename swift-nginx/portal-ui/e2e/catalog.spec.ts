import { expect, test } from '@playwright/test'

import { setupApiMocks } from './fixtures/api'
import { seedAuthenticatedSession } from './support'

test('入场页的进入按钮悬停后保持可见并进入商城首页', async ({ page }) => {
  await page.goto('/')

  const enterButton = page.getByRole('button', { name: 'ENTER 进入首页' })
  await expect(enterButton).toBeVisible()
  await page.waitForTimeout(1800)
  await enterButton.hover()
  await expect(enterButton).toBeVisible()
  await expect(enterButton).toHaveCSS('opacity', '1')

  await enterButton.click()
  await expect(page).toHaveURL(/\/home$/)
})

test('商品详情加入购物袋会提交初始数量', async ({ page }) => {
  await seedAuthenticatedSession(page)
  const api = await setupApiMocks(page, { cartItems: [] })

  await page.goto('/product/1001')
  await page.getByRole('button', { name: '加入购物袋' }).click()
  await expect(page.getByText('商品已加入购物袋')).toBeVisible()

  const addCall = api.calls.find((call) => call.method === 'POST' && call.path === '/carts')
  expect(addCall?.body?.num).toBe(1)
})

test('首页展示真实搜索结果并可进入商品详情', async ({ page }) => {
  const api = await setupApiMocks(page)

  await page.goto('/home')
  await expect(page.getByRole('heading', { name: /重新发现/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: '新品上架' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Aura 无线降噪耳机' })).toBeVisible()

  await page.goto('/search?key=Aura')
  await expect(page.getByRole('heading', { name: '“Aura” 的搜索结果' })).toBeVisible()
  await expect(page.getByText('1 件商品')).toBeVisible()
  await expect.poll(() => api.calls.some((call) => (
    call.method === 'GET'
      && call.path === '/search/list'
      && call.query.key === 'Aura'
  ))).toBe(true)

  await page.getByRole('link', { name: 'Aura 无线降噪耳机' }).click()
  await expect(page).toHaveURL(/\/product\/1001$/)
  await expect(page.getByRole('heading', { name: 'Aura 无线降噪耳机' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '商品规格' })).toBeVisible()
  await expect(page.getByRole('button', { name: '加入购物袋' })).toBeEnabled()
})
