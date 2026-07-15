import type { Address, CreateOrderInput, Order } from '@/types'
import { normalizeId } from '@/utils/id'
import { apiRequest } from './api'
import { normalizeAddress, normalizeOrder } from './normalizers'

export async function getAddresses(): Promise<Address[]> {
  const response = await apiRequest<unknown>({ method: 'GET', url: '/addresses' })
  return Array.isArray(response) ? response.map(normalizeAddress) : []
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    url: '/orders',
    data: {
      addressId: normalizeId(input.addressId),
      paymentType: 3,
      details: input.details.map((detail) => ({
        itemId: normalizeId(detail.itemId),
        num: Math.max(1, Math.trunc(detail.num)),
      })),
    },
  })
  return normalizeId(response, 'orderId')
}

export async function getOrder(orderId: string): Promise<Order> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    url: `/orders/${normalizeId(orderId)}`,
  })
  return normalizeOrder(response)
}
