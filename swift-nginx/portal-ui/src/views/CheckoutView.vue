<script setup lang="ts">
import { ArrowLeft, ArrowRight, Check, MapPin, PackageCheck, RefreshCw } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/EmptyState.vue'
import { useNotice } from '@/composables/useNotice'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import type { Address } from '@/types'
import { formatCents } from '@/utils/money'
import { parseSpec } from '@/utils/spec'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const checkout = useCheckoutStore()
const notice = useNotice()

const selectedCartIds = ref<string[]>([])

const missingItemCount = computed(
  () => Math.max(0, selectedCartIds.value.length - checkout.items.length),
)
const selectedAddress = computed(
  () => checkout.addresses.find((address) => address.id === checkout.addressId) ?? null,
)

function displayName(name: string): string {
  return name.replace(/^test\s*/i, '').trim() || name
}

function specSummary(spec: string): string {
  return Object.values(parseSpec(spec)).filter(Boolean).join(' / ')
}

function routeSelection(): string[] {
  const value = route.query.ids
  const values = Array.isArray(value) ? value : value == null ? [] : [value]
  return values
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    .map((entry) => entry.trim())
}

function resolveSelection(): string[] {
  const fromRoute = routeSelection()
  return fromRoute.length > 0 ? fromRoute : [...cart.selectedIds]
}

function fullAddress(address: Address): string {
  return [address.province, address.city, address.town, address.street]
    .filter(Boolean)
    .join(' ')
}

function maskedMobile(mobile: string): string {
  if (mobile.length < 7) return mobile
  return `${mobile.slice(0, 3)} **** ${mobile.slice(-4)}`
}

async function loadCheckout(reset = false) {
  if (reset) checkout.$reset()
  selectedCartIds.value = resolveSelection()

  try {
    await checkout.load(selectedCartIds.value)
  } catch (error) {
    notice.error(error instanceof Error ? error.message : '结算信息加载失败')
  }
}

async function submitOrder() {
  if (!checkout.addressId) {
    notice.error('当前账户没有可用的收货地址')
    return
  }
  if (checkout.items.length === 0) {
    notice.error('没有可结算的商品')
    return
  }

  try {
    const orderId = await checkout.submit()
    const submittedIds = new Set(selectedCartIds.value)
    cart.selectedIds = cart.selectedIds.filter((id) => !submittedIds.has(id))
    await router.push({ name: 'pay', params: { orderId } })
  } catch (error) {
    notice.error(error instanceof Error ? error.message : '订单提交失败')
  }
}

onMounted(() => loadCheckout(true))
</script>

<template>
  <main class="checkout-page page-shell container">
    <button class="checkout-back" type="button" @click="router.push({ name: 'cart' })">
      <ArrowLeft :size="17" /> 返回购物袋
    </button>

    <header class="checkout-heading">
      <p class="eyebrow">CHECKOUT</p>
      <h1 class="page-title">确认订单</h1>
      <p>核对收货信息和商品后提交订单。</p>
    </header>

    <div v-if="checkout.loading" class="checkout-loading" aria-label="正在加载结算信息">
      <div class="checkout-loading__main"><span></span><span></span><span></span></div>
      <div class="checkout-loading__side"></div>
    </div>

    <EmptyState
      v-else-if="checkout.error && !checkout.items.length"
      title="结算信息暂时无法加载"
      :description="checkout.error"
      action-label="重新加载"
      @action="loadCheckout()"
    >
      <template #icon><RefreshCw :size="38" :stroke-width="1.4" /></template>
    </EmptyState>

    <EmptyState
      v-else-if="!checkout.items.length"
      title="没有可结算的商品"
      description="商品可能已下架、库存不足，或购物袋中的选择已失效。"
      action-label="返回购物袋"
      @action="router.push({ name: 'cart' })"
    >
      <template #icon><PackageCheck :size="42" :stroke-width="1.4" /></template>
    </EmptyState>

    <div v-else class="checkout-layout">
      <div class="checkout-content">
        <p v-if="checkout.error" class="status-message status-message--error">{{ checkout.error }}</p>
        <p v-if="missingItemCount > 0" class="status-message">
          {{ missingItemCount }} 件商品因下架或库存变化未进入本次结算，请返回购物袋查看。
        </p>

        <section class="checkout-section" aria-labelledby="address-heading">
          <div class="checkout-section__heading">
            <div>
              <p class="eyebrow">01</p>
              <h2 id="address-heading" class="section-title">收货地址</h2>
            </div>
            <span v-if="checkout.addresses.length">{{ checkout.addresses.length }} 个地址</span>
          </div>

          <div v-if="checkout.addresses.length" class="address-list">
            <label
              v-for="address in checkout.addresses"
              :key="address.id"
              class="address-card"
              :class="{ 'address-card--selected': checkout.addressId === address.id }"
            >
              <input v-model="checkout.addressId" type="radio" name="address" :value="address.id" />
              <span class="address-card__indicator"><Check :size="15" /></span>
              <span class="address-card__body">
                <span class="address-card__topline">
                  <strong>{{ address.contact }}</strong>
                  <span v-if="address.isDefault">默认地址</span>
                </span>
                <span>{{ maskedMobile(address.mobile) }}</span>
                <span>{{ fullAddress(address) }}</span>
                <span v-if="address.notes" class="address-card__notes">{{ address.notes }}</span>
              </span>
            </label>
          </div>

          <div v-else class="address-empty">
            <MapPin :size="30" :stroke-width="1.4" />
            <div>
              <h3>没有可用的收货地址</h3>
              <p>当前商城暂未提供前台地址编辑能力，无法提交本次订单。</p>
            </div>
          </div>
        </section>

        <section class="checkout-section" aria-labelledby="items-heading">
          <div class="checkout-section__heading">
            <div>
              <p class="eyebrow">02</p>
              <h2 id="items-heading" class="section-title">商品清单</h2>
            </div>
            <span>{{ checkout.items.length }} 件商品</span>
          </div>

          <div class="checkout-items">
            <article v-for="item in checkout.items" :key="item.id" class="checkout-item">
              <RouterLink class="checkout-item__image" :to="{ name: 'product', params: { id: item.itemId } }">
                <img :src="item.image" :alt="displayName(item.name)" />
              </RouterLink>
              <div class="checkout-item__copy">
                <RouterLink :to="{ name: 'product', params: { id: item.itemId } }">
                  <h3>{{ displayName(item.name) }}</h3>
                </RouterLink>
                <p v-if="specSummary(item.spec)">{{ specSummary(item.spec) }}</p>
                <span>数量 {{ item.num }}</span>
              </div>
              <div class="checkout-item__price">
                <strong>{{ formatCents((item.newPrice ?? item.price) * item.num) }}</strong>
                <span>{{ formatCents(item.newPrice ?? item.price) }} / 件</span>
              </div>
            </article>
          </div>
        </section>
      </div>

      <aside class="checkout-summary">
        <h2 class="section-title">订单摘要</h2>
        <dl>
          <div>
            <dt>商品数量</dt>
            <dd>{{ checkout.items.reduce((sum, item) => sum + item.num, 0) }} 件</dd>
          </div>
          <div class="checkout-summary__total">
            <dt>应付金额</dt>
            <dd>{{ formatCents(checkout.total) }}</dd>
          </div>
        </dl>

        <div v-if="selectedAddress" class="checkout-summary__address">
          <MapPin :size="17" />
          <p>
            <strong>{{ selectedAddress.contact }}</strong>
            <span>{{ fullAddress(selectedAddress) }}</span>
          </p>
        </div>

        <button
          class="btn btn--primary btn--full checkout-summary__submit"
          type="button"
          :disabled="!checkout.canSubmit || checkout.submitting"
          @click="submitOrder"
        >
          {{ checkout.submitting ? '正在提交...' : '提交订单' }}
          <ArrowRight v-if="!checkout.submitting" :size="18" />
        </button>
        <p>提交后将创建真实订单并进入余额支付。</p>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.checkout-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  font-size: 13px;
}

.checkout-back:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.checkout-heading {
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-ink);
}

.checkout-heading .page-title {
  margin-top: 4px;
}

.checkout-heading > p:last-child {
  margin-top: 10px;
  color: var(--color-muted);
  font-size: 13px;
}

.checkout-layout,
.checkout-loading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  gap: 64px;
  margin-top: 40px;
}

.checkout-content {
  display: grid;
  gap: 48px;
}

.checkout-content > .status-message + .status-message {
  margin-top: -32px;
}

.checkout-section {
  min-width: 0;
}

.checkout-section__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.checkout-section__heading .section-title {
  margin-top: 3px;
}

.checkout-section__heading > span {
  padding-bottom: 3px;
  color: var(--color-muted);
  font-size: 12px;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.address-card {
  position: relative;
  display: grid;
  min-height: 156px;
  grid-template-columns: 20px 1fr;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: border-color 160ms ease;
}

.address-card:hover,
.address-card--selected {
  border-color: var(--color-ink);
}

.address-card input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.address-card__indicator {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border: 1px solid var(--color-muted);
  border-radius: 50%;
  color: transparent;
}

.address-card--selected .address-card__indicator {
  border-color: var(--color-ink);
  color: var(--color-white);
  background: var(--color-ink);
}

.address-card__body {
  display: grid;
  align-content: start;
  gap: 6px;
  min-width: 0;
  color: var(--color-muted);
  font-size: 13px;
  line-height: 19px;
}

.address-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--color-ink);
}

.address-card__topline strong {
  font-size: 15px;
}

.address-card__topline > span {
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
}

.address-card__notes {
  font-size: 12px;
}

.address-empty {
  display: flex;
  min-height: 156px;
  align-items: center;
  gap: 18px;
  margin-top: 20px;
  padding: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.address-empty h3 {
  font-size: 15px;
  font-weight: 600;
}

.address-empty p {
  margin-top: 5px;
  color: var(--color-muted);
  font-size: 13px;
}

.checkout-items {
  display: grid;
}

.checkout-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) auto;
  gap: 20px;
  padding-block: 20px;
  border-bottom: 1px solid var(--color-border);
}

.checkout-item__image {
  display: grid;
  width: 120px;
  aspect-ratio: 4 / 5;
  place-items: center;
  overflow: hidden;
  background: var(--color-surface);
}

.checkout-item__image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.checkout-item__copy {
  min-width: 0;
}

.checkout-item__copy h3 {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.checkout-item__copy a:hover h3 {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.checkout-item__copy p,
.checkout-item__copy span,
.checkout-item__price span {
  display: block;
  margin-top: 6px;
  color: var(--color-muted);
  font-size: 12px;
  line-height: 18px;
}

.checkout-item__price {
  text-align: right;
  white-space: nowrap;
}

.checkout-item__price strong {
  font-size: 15px;
}

.checkout-summary {
  position: sticky;
  top: calc(var(--header-height) + 32px);
  align-self: start;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.checkout-summary dl {
  display: grid;
  gap: 14px;
  margin: 28px 0 24px;
}

.checkout-summary dl > div {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.checkout-summary dd {
  margin: 0;
  font-weight: 600;
}

.checkout-summary__total {
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
  font-size: 17px;
}

.checkout-summary__address {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 24px;
  padding-block: 16px;
  border-block: 1px solid var(--color-border);
}

.checkout-summary__address svg {
  flex: 0 0 auto;
  margin-top: 2px;
}

.checkout-summary__address p {
  display: grid;
  gap: 4px;
  min-width: 0;
  font-size: 12px;
  line-height: 18px;
}

.checkout-summary__address span {
  color: var(--color-muted);
}

.checkout-summary__submit {
  min-height: 48px;
}

.checkout-summary > p {
  margin-top: 14px;
  color: var(--color-muted);
  font-size: 12px;
}

.checkout-loading__main {
  display: grid;
  gap: 32px;
}

.checkout-loading__main span,
.checkout-loading__side {
  min-height: 220px;
  background: var(--color-surface);
}

.checkout-loading__main span:first-child {
  min-height: 300px;
}

.checkout-loading__side {
  min-height: 360px;
}

@media (max-width: 1000px) {
  .checkout-layout,
  .checkout-loading {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 32px;
  }

  .address-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .checkout-layout,
  .checkout-loading {
    grid-template-columns: 1fr;
  }

  .checkout-summary {
    position: static;
    order: -1;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border);
  }
}

@media (max-width: 520px) {
  .checkout-back {
    margin-bottom: 12px;
  }

  .checkout-heading {
    padding-bottom: 24px;
  }

  .checkout-layout {
    gap: 32px;
    margin-top: 28px;
  }

  .checkout-content {
    gap: 40px;
  }

  .address-card {
    min-height: 144px;
    padding: 16px;
  }

  .checkout-item {
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 14px;
  }

  .checkout-item__image {
    width: 92px;
    grid-row: span 2;
  }

  .checkout-item__price {
    grid-column: 2;
    text-align: left;
  }
}
</style>
