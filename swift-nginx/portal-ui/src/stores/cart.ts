import { defineStore } from 'pinia'

import {
  addCartItem,
  deleteCartItem,
  deleteCartItemsByItemIds,
  getCartItems,
  updateCartQuantity,
} from '@/services/cart'
import { normalizeApiError } from '@/services/api'
import type { AddCartItemInput, CartItem, Identifier } from '@/types'

interface CartState {
  items: CartItem[]
  selectedIds: Identifier[]
  loading: boolean
  mutating: boolean
  error: string | null
}

function purchasable(item: CartItem): boolean {
  return item.status === 1 && item.stock >= item.num && item.num > 0
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    selectedIds: [],
    loading: false,
    mutating: false,
    error: null,
  }),
  getters: {
    availableItems: (state) => state.items.filter(purchasable),
    selectedItems: (state) => state.items.filter((item) => state.selectedIds.includes(item.id) && purchasable(item)),
    selectedTotal(): number {
      return this.selectedItems.reduce(
        (total, item) => total + (item.newPrice ?? item.price) * item.num,
        0,
      )
    },
    itemCount: (state) => state.items.reduce((total, item) => total + item.num, 0),
    allAvailableSelected(): boolean {
      return this.availableItems.length > 0
        && this.availableItems.every((item) => this.selectedIds.includes(item.id))
    },
  },
  actions: {
    async load(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.items = await getCartItems()
        const validIds = new Set(this.items.filter(purchasable).map((item) => item.id))
        const retained = this.selectedIds.filter((id) => validIds.has(id))
        this.selectedIds = retained.length > 0 ? retained : [...validIds]
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.loading = false
      }
    },
    async add(input: AddCartItemInput): Promise<void> {
      await this.mutate(async () => {
        await addCartItem(input)
        await this.load()
      })
    },
    async setQuantity(item: CartItem, num: number): Promise<void> {
      const quantity = Math.min(item.stock, Math.max(1, Math.trunc(num)))
      if (quantity === item.num) return
      await this.mutate(async () => {
        await updateCartQuantity(item.id, quantity)
        await this.load()
      })
    },
    async remove(item: CartItem): Promise<void> {
      await this.mutate(async () => {
        await deleteCartItem(item.id)
        this.items = this.items.filter((entry) => entry.id !== item.id)
        this.selectedIds = this.selectedIds.filter((id) => id !== item.id)
      })
    },
    async removeSelected(): Promise<void> {
      const selected = this.selectedItems
      if (selected.length === 0) return
      await this.mutate(async () => {
        await deleteCartItemsByItemIds(selected.map((item) => item.itemId))
        const selectedIds = new Set(selected.map((item) => item.id))
        this.items = this.items.filter((item) => !selectedIds.has(item.id))
        this.selectedIds = []
      })
    },
    toggle(item: CartItem): void {
      if (!purchasable(item)) return
      this.selectedIds = this.selectedIds.includes(item.id)
        ? this.selectedIds.filter((id) => id !== item.id)
        : [...this.selectedIds, item.id]
    },
    toggleAll(): void {
      this.selectedIds = this.allAvailableSelected
        ? []
        : this.availableItems.map((item) => item.id)
    },
    async mutate(operation: () => Promise<void>): Promise<void> {
      this.mutating = true
      this.error = null
      try {
        await operation()
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.mutating = false
      }
    },
  },
})
