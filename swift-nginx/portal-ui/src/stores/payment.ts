import { defineStore } from 'pinia'

import { normalizeApiError } from '@/services/api'
import { getOrder } from '@/services/checkout'
import { createBalancePayOrder, getPayOrderByOrderId, payByBalance } from '@/services/payment'
import type { Order, PayOrder } from '@/types'

interface PaymentState {
  order: Order | null
  payOrderId: string | null
  payOrder: PayOrder | null
  loading: boolean
  submitting: boolean
  error: string | null
}

export const usePaymentStore = defineStore('payment', {
  state: (): PaymentState => ({
    order: null,
    payOrderId: null,
    payOrder: null,
    loading: false,
    submitting: false,
    error: null,
  }),
  actions: {
    async load(orderId: string, createPayment = false): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.order = await getOrder(orderId)
        if (createPayment && this.order.status === 1) {
          this.payOrderId = await createBalancePayOrder(this.order)
        }
        this.payOrder = await getPayOrderByOrderId(orderId)
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.loading = false
      }
    },
    async pay(password: string): Promise<void> {
      if (!this.payOrderId) {
        throw new Error('支付单尚未创建')
      }
      this.submitting = true
      this.error = null
      try {
        await payByBalance(this.payOrderId, password)
        if (this.order) {
          await this.load(this.order.id)
        }
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
