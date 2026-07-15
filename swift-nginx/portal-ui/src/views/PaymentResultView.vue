<script setup lang="ts">
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from 'lucide-vue-next'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/EmptyState.vue'
import { useNotice } from '@/composables/useNotice'
import { usePaymentStore } from '@/stores/payment'
import { formatCents } from '@/utils/money'

type ResultTone = 'success' | 'pending' | 'failed' | 'unknown'

const route = useRoute()
const router = useRouter()
const payment = usePaymentStore()
const notice = useNotice()

const orderId = computed(() => String(route.params.orderId ?? ''))
const amount = computed(() => payment.payOrder?.amount ?? payment.order?.totalFee ?? 0)
const resultTone = computed<ResultTone>(() => {
  if (payment.payOrder?.status === 3) return 'success'
  if (payment.order && [2, 3, 4, 6].includes(payment.order.status)) return 'success'
  if (payment.payOrder?.status === 2 || payment.order?.status === 5) return 'failed'
  if (payment.order?.status === 1 && [0, 1].includes(payment.payOrder?.status ?? 1)) return 'pending'
  return 'unknown'
})
const resultTitle = computed(() => ({
  success: '支付成功',
  pending: '等待支付',
  failed: '支付未完成',
  unknown: '暂时无法确认支付结果',
})[resultTone.value])
const resultDescription = computed(() => ({
  success: '订单已进入后续处理流程，支付结果已由服务确认。',
  pending: '订单仍处于待支付状态，可返回收银台继续完成支付。',
  failed: '订单或支付单已经关闭，本次支付没有完成。',
  unknown: '订单状态与支付状态尚未形成明确结果，请重新查询。',
})[resultTone.value])
const orderStatusLabel = computed(() => {
  const labels: Record<number, string> = {
    1: '待支付',
    2: '已支付，待发货',
    3: '已发货',
    4: '交易完成',
    5: '订单已关闭',
    6: '交易已评价',
  }
  return payment.order ? (labels[payment.order.status] ?? `状态 ${payment.order.status}`) : '暂未取得'
})
const payStatusLabel = computed(() => {
  const labels: Record<number, string> = {
    0: '待提交',
    1: '待支付',
    2: '支付已关闭',
    3: '支付成功',
  }
  return payment.payOrder ? (labels[payment.payOrder.status] ?? `状态 ${payment.payOrder.status}`) : '暂未取得'
})
const completedAt = computed(
  () => payment.payOrder?.paySuccessTime ?? payment.order?.payTime ?? '',
)
const canRetryPayment = computed(
  () => payment.order?.status === 1 && payment.payOrder?.status !== 3,
)

function formatDateTime(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

async function loadResult(reset = false) {
  if (!orderId.value) return
  if (reset) payment.$reset()

  try {
    await payment.load(orderId.value)
  } catch (error) {
    notice.error(error instanceof Error ? error.message : '支付结果查询失败')
  }
}

function primaryAction() {
  if (canRetryPayment.value) {
    return router.push({ name: 'pay', params: { orderId: orderId.value } })
  }
  return router.push({ name: 'home' })
}

watch(orderId, () => loadResult(true), { immediate: true })
</script>

<template>
  <main class="result-page page-shell container--narrow">
    <div v-if="payment.loading" class="result-loading" aria-label="正在查询支付结果">
      <span class="result-loading__icon"></span>
      <span class="result-loading__title"></span>
      <span class="result-loading__body"></span>
    </div>

    <EmptyState
      v-else-if="payment.error && !payment.order"
      title="支付结果暂时无法查询"
      :description="payment.error"
      action-label="重新查询"
      @action="loadResult()"
    >
      <template #icon><RefreshCw :size="40" :stroke-width="1.4" /></template>
    </EmptyState>

    <article v-else class="result-card" :class="`result-card--${resultTone}`">
      <div class="result-card__icon" aria-hidden="true">
        <CheckCircle2 v-if="resultTone === 'success'" :size="54" :stroke-width="1.35" />
        <Clock3 v-else-if="resultTone === 'pending'" :size="54" :stroke-width="1.35" />
        <XCircle v-else-if="resultTone === 'failed'" :size="54" :stroke-width="1.35" />
        <RefreshCw v-else :size="50" :stroke-width="1.35" />
      </div>

      <p class="eyebrow">PAYMENT RESULT</p>
      <h1>{{ resultTitle }}</h1>
      <p class="result-card__description">{{ resultDescription }}</p>

      <p v-if="payment.error" class="status-message status-message--error result-card__error">
        {{ payment.error }}
      </p>

      <dl class="result-details">
        <div>
          <dt>订单号</dt>
          <dd>{{ payment.order?.id ?? orderId }}</dd>
        </div>
        <div>
          <dt>订单状态</dt>
          <dd>{{ orderStatusLabel }}</dd>
        </div>
        <div>
          <dt>支付状态</dt>
          <dd>{{ payStatusLabel }}</dd>
        </div>
        <div>
          <dt>支付方式</dt>
          <dd>账户余额</dd>
        </div>
        <div v-if="completedAt">
          <dt>支付时间</dt>
          <dd>{{ formatDateTime(completedAt) }}</dd>
        </div>
        <div class="result-details__amount">
          <dt>订单金额</dt>
          <dd>{{ formatCents(amount) }}</dd>
        </div>
      </dl>

      <div class="result-actions">
        <button class="btn btn--primary" type="button" @click="primaryAction">
          {{ canRetryPayment ? '继续支付' : '继续购物' }} <ArrowRight :size="18" />
        </button>
        <button class="btn btn--secondary" type="button" :disabled="payment.loading" @click="loadResult()">
          <RefreshCw :size="17" /> 重新查询
        </button>
        <button class="result-actions__cart" type="button" @click="router.push({ name: 'cart' })">
          <ShoppingBag :size="16" /> 返回购物袋
        </button>
      </div>
    </article>
  </main>
</template>

<style scoped>
.result-page {
  display: grid;
  place-items: center;
}

.result-card,
.result-loading {
  width: min(100%, 720px);
  text-align: center;
}

.result-card__icon {
  display: grid;
  width: 72px;
  height: 72px;
  place-items: center;
  margin: 0 auto 20px;
  color: var(--color-muted);
}

.result-card--success .result-card__icon {
  color: var(--color-success);
}

.result-card--failed .result-card__icon {
  color: var(--color-accent);
}

.result-card h1 {
  margin-top: 6px;
  font-size: 30px;
  font-weight: 400;
  line-height: 40px;
}

.result-card__description {
  max-width: 520px;
  margin: 12px auto 0;
  color: var(--color-muted);
  line-height: 22px;
}

.result-card__error {
  margin-top: 24px;
  text-align: left;
}

.result-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 40px 0 32px;
  border-top: 1px solid var(--color-ink);
  text-align: left;
}

.result-details > div {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
}

.result-details > div:nth-child(odd) {
  border-right: 1px solid var(--color-border);
}

.result-details dt {
  color: var(--color-muted);
  font-size: 12px;
}

.result-details dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 600;
}

.result-details__amount dd {
  font-size: 17px;
}

.result-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.result-actions__cart {
  display: inline-flex;
  min-height: 40px;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  border: 0;
  background: transparent;
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.result-loading {
  display: grid;
  justify-items: center;
  gap: 16px;
}

.result-loading span {
  display: block;
  background: var(--color-surface);
}

.result-loading__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
}

.result-loading__title {
  width: min(70%, 280px);
  height: 40px;
}

.result-loading__body {
  width: min(100%, 560px);
  height: 220px;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .result-card h1 {
    font-size: 24px;
    line-height: 32px;
  }

  .result-details {
    grid-template-columns: 1fr;
    margin-top: 32px;
  }

  .result-details > div:nth-child(odd) {
    border-right: 0;
  }

  .result-actions {
    grid-template-columns: 1fr;
  }

  .result-actions__cart {
    grid-column: auto;
  }
}
</style>
