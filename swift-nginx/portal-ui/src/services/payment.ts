import type { CreatePayOrderInput, Order, PayOrder } from '@/types'
import { normalizeId } from '@/utils/id'
import { apiRequest } from './api'
import { normalizePayOrder } from './normalizers'

export async function createBalancePayOrder(order: Order): Promise<string> {
  const input: CreatePayOrderInput = {
    bizOrderNo: order.id,
    amount: order.totalFee,
    payChannelCode: 'balance',
    payType: 5,
    orderInfo: 'SwiftShop商品',
  }
  const response = await apiRequest<unknown>({ method: 'POST', url: '/pay-orders', data: input })
  return normalizeId(response, 'payOrderId')
}

export async function payByBalance(payOrderId: string, password: string): Promise<void> {
  const id = normalizeId(payOrderId, 'payOrderId')
  await apiRequest<void>({
    method: 'POST',
    url: `/pay-orders/${id}`,
    data: { id, pw: password },
  })
}

export async function getPayOrderByOrderId(orderId: string): Promise<PayOrder> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    url: `/pay-orders/biz/${normalizeId(orderId, 'orderId')}`,
  })
  return normalizePayOrder(response)
}
