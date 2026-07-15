import { defineStore } from 'pinia'

import { normalizeApiError } from '@/services/api'
import { createOrder, getAddresses } from '@/services/checkout'
import { getCartItems } from '@/services/cart'
import type { Address, CartItem, Identifier } from '@/types'

interface CheckoutState {
  items: CartItem[]
  addresses: Address[]
  addressId: Identifier | null
  loading: boolean
  submitting: boolean
  error: string | null
}

export const useCheckoutStore = defineStore('checkout', {
  state: (): CheckoutState => ({
    items: [],
    addresses: [],
    addressId: null,
    loading: false,
    submitting: false,
    error: null,
  }),
  getters: {
    canSubmit: (state) => Boolean(state.addressId && state.items.length > 0),
    total: (state) => state.items.reduce(
      (sum, item) => sum + (item.newPrice ?? item.price) * item.num,
      0,
    ),
  },
  actions: {
    async load(selectedCartIds: Identifier[]): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const [cartItems, addresses] = await Promise.all([getCartItems(), getAddresses()])
        const selected = new Set(selectedCartIds)
        this.items = cartItems.filter(
          (item) => selected.has(item.id) && item.status === 1 && item.stock >= item.num,
        )
        this.addresses = addresses
        const currentExists = addresses.some((address) => address.id === this.addressId)
        this.addressId = currentExists
          ? this.addressId
          : (addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? null)
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.loading = false
      }
    },
    async submit(): Promise<Identifier> {
      if (!this.addressId || this.items.length === 0) {
        throw new Error('请选择收货地址和结算商品')
      }

      this.submitting = true
      this.error = null
      try {
        return await createOrder({
          addressId: this.addressId,
          paymentType: 3,
          details: this.items.map((item) => ({ itemId: item.itemId, num: item.num })),
        })
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.submitting = false
      }
    },
  },
})
