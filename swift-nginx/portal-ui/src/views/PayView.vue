<script setup lang="ts">
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  WalletCards,
  XCircle,
} from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/EmptyState.vue'
import { useNotice } from '@/composables/useNotice'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payment'
import { formatCents } from '@/utils/money'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const payment = usePaymentStore()
const notice = useNotice()

const password = ref('')
const passwordVisible = ref(false)
const passwordError = ref('')
const now = ref(Date.now())
let clock: number | undefined

const orderId = computed(() => String(route.params.orderId ?? ''))
const amount = computed(() => payment.payOrder?.amount ?? payment.order?.totalFee ?? 0)
const balance = computed(() => auth.user?.balance ?? 0)
const insufficientBalance = computed(() => Boolean(payment.order && balance.value < amount.value))
const paymentSucceeded = computed(
  () => payment.payOrder?.status === 3 || Boolean(payment.order && payment.order.status >= 2 && payment.order.status !== 5),
)
const paymentClosed = computed(
  () => payment.payOrder?.status === 2 || payment.order?.status === 5,
)
const deadlineTime = computed(() => {
  const value = payment.payOrder?.payOverTime
  if (!value) return null
  const result = new Date(value).getTime()
  return Number.isFinite(result) ? result : null
})
const deadlinePassed = computed(() => deadlineTime.value != null && now.value >= deadlineTime.value)
const canPay = computed(() => Boolean(
  payment.order?.status === 1
  && payment.payOrderId
  && !paymentClosed.value
  && !deadlinePassed.value
  && !insufficientBalance.value
  && !payment.submitting,
))
const deadlineLabel = computed(() => {
  if (deadlineTime.value == null) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(deadlineTime.value)
})

async function loadPayment(reset = false) {
  if (!orderId.value) return
  if (reset) {
    payment.$reset()
    password.value = ''
    passwordError.value = ''
  }

  try {
    await payment.load(orderId.value, true)
    if (paymentSucceeded.value) {
      await router.replace({ name: 'payment-result', params: { orderId: orderId.value } })
    }
  } catch (error) {
    notice.error(error instanceof Error ? error.message : '支付信息加载失败')
  }
}

async function submitPayment() {
  passwordError.value = ''

  if (!password.value) {
    passwordError.value = '请输入当前账户的登录密码'
    return
  }
  if (!canPay.value) return

  try {
    await payment.pay(password.value)
    await router.replace({ name: 'payment-result', params: { orderId: orderId.value } })
  } catch (error) {
    notice.error(error instanceof Error ? error.message : '余额支付失败')
  }
}

function goToResult() {
  return router.push({ name: 'payment-result', params: { orderId: orderId.value } })
}

watch(orderId, () => loadPayment(true), { immediate: true })

onMounted(() => {
  clock = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (clock != null) window.clearInterval(clock)
})
</script>

<template>
  <main class="pay-page page-shell container--narrow">
    <header class="pay-heading">
      <p class="eyebrow">SECURE CHECKOUT</p>
      <h1 class="page-title">订单支付</h1>
      <p>SwiftShop 当前仅支持账户余额支付。</p>
    </header>

    <div v-if="payment.loading" class="pay-loading" aria-label="正在加载支付信息">
      <span></span><span></span>
    </div>

    <EmptyState
      v-else-if="payment.error && !payment.order"
      title="支付信息暂时无法加载"
      :description="payment.error"
      action-label="重新加载"
      @action="loadPayment()"
    >
      <template #icon><RefreshCw :size="40" :stroke-width="1.4" /></template>
    </EmptyState>

    <EmptyState
      v-else-if="paymentClosed || deadlinePassed"
      title="该订单已无法支付"
      description="订单或支付单已关闭，请查看最新结果后重新选购。"
      action-label="查看支付结果"
      @action="goToResult"
    >
      <template #icon><XCircle :size="42" :stroke-width="1.4" /></template>
    </EmptyState>

    <div v-else-if="payment.order" class="pay-layout">
      <form class="payment-panel" @submit.prevent="submitPayment">
        <section class="payment-section">
          <div class="payment-section__heading">
            <div>
              <p class="eyebrow">PAYMENT METHOD</p>
              <h2 class="section-title">选择支付方式</h2>
            </div>
            <ShieldCheck :size="22" :stroke-width="1.5" />
          </div>

          <div class="balance-method" aria-label="余额支付已选择">
            <span class="balance-method__radio"><span></span></span>
            <WalletCards :size="22" :stroke-width="1.5" />
            <span class="balance-method__copy">
              <strong>账户余额</strong>
              <small>可用余额 {{ formatCents(balance) }}</small>
            </span>
          </div>

          <p v-if="insufficientBalance" class="status-message status-message--error">
            账户余额不足，当前订单无法完成余额支付。
          </p>
        </section>

        <section class="payment-section payment-password">
          <div>
            <p class="eyebrow">VERIFICATION</p>
            <h2 class="section-title">验证账户</h2>
          </div>

          <label class="field" for="account-password">
            <span class="field__label">账户登录密码</span>
            <span class="password-control">
              <LockKeyhole :size="18" />
              <input
                id="account-password"
                v-model="password"
                class="field__control"
                :type="passwordVisible ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="输入登录密码确认支付"
                :disabled="payment.submitting || insufficientBalance"
                @input="passwordError = ''"
              />
              <button
                class="icon-btn"
                type="button"
                :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
                :title="passwordVisible ? '隐藏密码' : '显示密码'"
                @click="passwordVisible = !passwordVisible"
              >
                <EyeOff v-if="passwordVisible" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </span>
            <span v-if="passwordError" class="field__error">{{ passwordError }}</span>
          </label>

          <p v-if="payment.error" class="status-message status-message--error">{{ payment.error }}</p>
        </section>

        <button class="btn btn--primary btn--full payment-submit" type="submit" :disabled="!canPay">
          {{ payment.submitting ? '正在支付...' : `支付 ${formatCents(amount)}` }}
          <ArrowRight v-if="!payment.submitting" :size="18" />
        </button>
      </form>

      <aside class="pay-summary">
        <h2 class="section-title">订单摘要</h2>
        <dl>
          <div>
            <dt>订单号</dt>
            <dd>{{ payment.order.id }}</dd>
          </div>
          <div>
            <dt>支付方式</dt>
            <dd>账户余额</dd>
          </div>
          <div v-if="deadlineLabel">
            <dt>支付截止</dt>
            <dd>{{ deadlineLabel }}</dd>
          </div>
          <div class="pay-summary__total">
            <dt>应付金额</dt>
            <dd>{{ formatCents(amount) }}</dd>
          </div>
        </dl>
        <p>支付结果以订单与支付服务返回的实时状态为准。</p>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.pay-heading {
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-ink);
}

.pay-heading .page-title {
  margin-top: 4px;
}

.pay-heading > p:last-child {
  margin-top: 10px;
  color: var(--color-muted);
  font-size: 13px;
}

.pay-layout,
.pay-loading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 48px;
  margin-top: 40px;
}

.payment-panel {
  display: grid;
  gap: 40px;
  min-width: 0;
}

.payment-section {
  display: grid;
  gap: 20px;
}

.payment-section__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.payment-section__heading .section-title,
.payment-password .section-title {
  margin-top: 3px;
}

.balance-method {
  display: grid;
  min-height: 82px;
  grid-template-columns: 20px 28px 1fr;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--color-ink);
}

.balance-method__radio {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border: 1px solid var(--color-ink);
  border-radius: 50%;
}

.balance-method__radio span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-ink);
}

.balance-method__copy {
  display: grid;
  gap: 3px;
}

.balance-method__copy strong {
  font-size: 15px;
}

.balance-method__copy small {
  color: var(--color-muted);
  font-size: 12px;
}

.payment-password > .field {
  margin-top: 4px;
}

.password-control {
  position: relative;
  display: flex;
  align-items: center;
}

.password-control > svg {
  position: absolute;
  z-index: 1;
  left: 14px;
  color: var(--color-muted);
  pointer-events: none;
}

.password-control .field__control {
  padding-inline: 44px 48px;
}

.password-control .icon-btn {
  position: absolute;
  right: 0;
}

.payment-submit {
  min-height: 48px;
}

.pay-summary {
  align-self: start;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.pay-summary dl {
  display: grid;
  gap: 16px;
  margin: 28px 0 20px;
}

.pay-summary dl > div {
  display: grid;
  gap: 4px;
}

.pay-summary dt {
  color: var(--color-muted);
  font-size: 12px;
}

.pay-summary dd {
  max-width: 100%;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 600;
}

.pay-summary__total {
  display: flex !important;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px !important;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}

.pay-summary__total dd {
  font-size: 18px;
}

.pay-summary > p {
  color: var(--color-muted);
  font-size: 12px;
  line-height: 18px;
}

.pay-loading span {
  min-height: 400px;
  background: var(--color-surface);
}

.pay-loading span:last-child {
  min-height: 300px;
}

@media (max-width: 760px) {
  .pay-layout,
  .pay-loading {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .pay-summary {
    order: -1;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border);
  }
}

@media (max-width: 480px) {
  .pay-heading {
    padding-bottom: 24px;
  }

  .pay-layout {
    margin-top: 28px;
  }

  .payment-panel {
    gap: 32px;
  }

  .balance-method {
    padding: 16px;
  }
}
</style>
