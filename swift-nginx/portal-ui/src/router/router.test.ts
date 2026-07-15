import { createMemoryHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'

import { setAuthSession } from '@/utils/session'
import { createAppRouter } from './index'

describe('portal router', () => {
  it('redirects protected pages to login and records the return path', async () => {
    const router = createAppRouter(createMemoryHistory())
    await router.push('/checkout?campaign=spring')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/checkout?campaign=spring')
  })

  it('maps legacy payment URLs while preserving their query', async () => {
    setAuthSession({ token: 'jwt', userId: '7', username: 'swift', balance: 5000 })
    const router = createAppRouter(createMemoryHistory())
    await router.push('/pay.html?id=1901849567409209344&campaign=spring')

    expect(router.currentRoute.value.name).toBe('pay')
    expect(router.currentRoute.value.params.orderId).toBe('1901849567409209344')
    expect(router.currentRoute.value.query).toEqual({
      id: '1901849567409209344',
      campaign: 'spring',
    })
  })

  it('maps legacy success URLs to the payment result route', async () => {
    setAuthSession({ token: 'jwt', userId: '7', username: 'swift', balance: 5000 })
    const router = createAppRouter(createMemoryHistory())
    await router.push('/paysuccess.html?orderId=12')

    expect(router.currentRoute.value.fullPath).toBe('/payment-result/12?orderId=12')
  })
})
