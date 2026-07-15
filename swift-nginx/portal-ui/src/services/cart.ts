import type { AddCartItemInput, CartItem } from '@/types'
import { normalizeId } from '@/utils/id'
import { apiRequest } from './api'
import { normalizeCartItem } from './normalizers'

export async function getCartItems(): Promise<CartItem[]> {
  const response = await apiRequest<unknown>({ method: 'GET', url: '/carts' })
  return Array.isArray(response) ? response.map(normalizeCartItem) : []
}

export async function addCartItem(item: AddCartItemInput): Promise<void> {
  const quantity = Number.isFinite(item.num) ? Math.max(1, Math.trunc(item.num)) : 1

  await apiRequest<void>({
    method: 'POST',
    url: '/carts',
    data: {
      ...item,
      itemId: normalizeId(item.itemId),
      num: quantity,
    },
  })
}

export async function updateCartQuantity(cartId: string, num: number): Promise<void> {
  await apiRequest<void>({
    method: 'PUT',
    url: '/carts',
    data: { id: normalizeId(cartId), num: Math.max(1, Math.trunc(num)) },
  })
}

export async function deleteCartItem(cartId: string): Promise<void> {
  await apiRequest<void>({ method: 'DELETE', url: `/carts/${normalizeId(cartId)}` })
}

export async function deleteCartItemsByItemIds(itemIds: string[]): Promise<void> {
  if (itemIds.length === 0) return
  await apiRequest<void>({
    method: 'DELETE',
    url: '/carts',
    params: { ids: itemIds.map((id) => normalizeId(id)) },
  })
}
