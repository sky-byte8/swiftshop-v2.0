<script setup lang="ts">
import { AlertTriangle, ArrowRight, PackageX, RefreshCw, ShoppingBag, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import ConfirmDialog from '@/components/ConfirmDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import QuantityStepper from '@/components/QuantityStepper.vue'
import { useNotice } from '@/composables/useNotice'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types'
import { formatCents } from '@/utils/money'
import { parseSpec } from '@/utils/spec'

const router = useRouter()
const cart = useCartStore()
const notice = useNotice()

const pendingRemoval = ref<CartItem | null>(null)
const bulkRemovalRequested = ref(false)

const selectedCount = computed(() => cart.selectedItems.length)
const someAvailableSelected = computed(
  () => cart.selectedIds.length > 0 && !cart.allAvailableSelected,
)
const confirmOpen = computed(() => Boolean(pendingRemoval.value || bulkRemovalRequested.value))
const confirmTitle = computed(() => (pendingRemoval.value ? '移除商品' : '移除所选商品'))
const confirmMessage = computed(() => pendingRemoval.value
  ? `确定从购物袋中移除“${displayName(pendingRemoval.value.name)}”吗？`
  : `确定移除已选择的 ${selectedCount.value} 件商品吗？`)

function displayName(name: string): string {
  return name.replace(/^test\s*/i, '').trim() || name
}

function specSummary(spec: string): string {
  return Object.values(parseSpec(spec)).filter(Boolean).join(' / ')
}

function isPurchasable(item: CartItem): boolean {
  return item.status === 1 && item.stock >= item.num && item.num > 0
}

function availabilityMessage(item: CartItem): string {
  if (item.status !== 1) return '商品已下架'
  if (item.stock < 1) return '商品暂时缺货'
  if (item.num > item.stock) return `库存不足，仅剩 ${item.stock} 件`
  return `有货 · 库存 ${item.stock} 件`
}

async function loadCart() {
  try {
    await cart.load()
  } catch (error) {
    notice.error(error instanceof Error ? error.message : '购物袋加载失败')
  }
}

async function changeQuantity(item: CartItem, quantity: number) {
  try {
    await cart.setQuantity(item, quantity)
  } catch (error) {
    notice.error(error instanceof Error ? error.message : '数量更新失败')
  }
}

function requestItemRemoval(item: CartItem) {
  pendingRemoval.value = item
  bulkRemovalRequested.value = false
}

function requestBulkRemoval() {
  if (selectedCount.value === 0) return
  pendingRemoval.value = null
  bulkRemovalRequested.value = true
}

function cancelRemoval() {
  if (cart.mutating) return
  pendingRemoval.value = null
  bulkRemovalRequested.value = false
}

async function confirmRemoval() {
  try {
    if (pendingRemoval.value) {
      await cart.remove(pendingRemoval.value)
      notice.success('商品已从购物袋移除')
    } else if (bulkRemovalRequested.value) {
      await cart.removeSelected()
      notice.success('所选商品已移除')
    }
    cancelRemoval()
  } catch (error) {
    notice.error(error instanceof Error ? error.message : '移除商品失败')
  }
}

async function goToCheckout() {
  if (cart.selectedItems.length === 0) {
    notice.error('请先选择可结算的商品')
    return
  }

  await router.push({
    name: 'checkout',
    query: { ids: cart.selectedItems.map((item) => item.id) },
  })
}

onMounted(loadCart)
</script>

<template>
  <main class="cart-page page-shell container">
    <header class="cart-heading">
      <div>
        <p class="eyebrow">SHOPPING BAG</p>
        <h1 class="page-title">购物袋</h1>
      </div>
      <p v-if="cart.items.length" class="cart-heading__count">{{ cart.itemCount }} 件商品</p>
    </header>

    <div v-if="cart.loading" class="cart-loading" aria-label="正在加载购物袋">
      <div v-for="index in 3" :key="index" class="cart-loading__row">
        <span></span><span></span>
      </div>
    </div>

    <EmptyState
      v-else-if="!cart.items.length && !cart.error"
      title="购物袋是空的"
      description="浏览本季商品，将喜欢的单品加入购物袋。"
      action-label="开始选购"
      @action="router.push({ name: 'search' })"
    >
      <template #icon><ShoppingBag :size="42" :stroke-width="1.4" /></template>
    </EmptyState>

    <section v-else-if="!cart.items.length && cart.error" class="cart-error">
      <AlertTriangle :size="28" :stroke-width="1.5" />
      <div>
        <h2 class="section-title">购物袋暂时无法加载</h2>
        <p>{{ cart.error }}</p>
      </div>
      <button class="btn btn--secondary" type="button" @click="loadCart">
        <RefreshCw :size="17" /> 重试
      </button>
    </section>

    <div v-else class="cart-layout">
      <section class="cart-list" aria-label="购物袋商品">
        <div class="cart-toolbar">
          <label class="select-control">
            <input
              type="checkbox"
              :checked="cart.allAvailableSelected"
              :indeterminate="someAvailableSelected"
              :disabled="cart.availableItems.length === 0 || cart.mutating"
              @change="cart.toggleAll()"
            />
            <span>全选可结算商品</span>
          </label>
          <button
            class="cart-toolbar__remove"
            type="button"
            :disabled="selectedCount === 0 || cart.mutating"
            @click="requestBulkRemoval"
          >
            <Trash2 :size="16" /> 删除所选
          </button>
        </div>

        <p v-if="cart.error" class="status-message status-message--error">{{ cart.error }}</p>

        <article
          v-for="item in cart.items"
          :key="item.id"
          class="cart-item"
          :class="{ 'cart-item--unavailable': !isPurchasable(item) }"
        >
          <label class="cart-item__select" :aria-label="`选择 ${displayName(item.name)}`">
            <input
              type="checkbox"
              :checked="cart.selectedIds.includes(item.id)"
              :disabled="!isPurchasable(item) || cart.mutating"
              @change="cart.toggle(item)"
            />
          </label>

          <RouterLink class="cart-item__image" :to="{ name: 'product', params: { id: item.itemId } }">
            <img :src="item.image" :alt="displayName(item.name)" />
          </RouterLink>

          <div class="cart-item__details">
            <div class="cart-item__copy">
              <RouterLink :to="{ name: 'product', params: { id: item.itemId } }">
                <h2>{{ displayName(item.name) }}</h2>
              </RouterLink>
              <p v-if="specSummary(item.spec)" class="cart-item__spec">{{ specSummary(item.spec) }}</p>
              <p class="cart-item__availability" :class="{ 'text-accent': !isPurchasable(item) }">
                <PackageX v-if="!isPurchasable(item)" :size="15" />
                {{ availabilityMessage(item) }}
              </p>
            </div>

            <div class="cart-item__price">
              <strong>{{ formatCents(item.newPrice ?? item.price) }}</strong>
              <span v-if="item.newPrice != null && item.newPrice < item.price">
                原价 {{ formatCents(item.price) }}
              </span>
            </div>

            <div class="cart-item__quantity">
              <span class="eyebrow">数量</span>
              <QuantityStepper
                :model-value="item.num"
                :max="Math.max(1, item.stock)"
                :disabled="item.status !== 1 || item.stock < 1"
                :busy="cart.mutating"
                @update:model-value="changeQuantity(item, $event)"
              />
            </div>

            <div class="cart-item__subtotal">
              <span class="eyebrow">小计</span>
              <strong>{{ formatCents((item.newPrice ?? item.price) * item.num) }}</strong>
            </div>

            <button
              class="icon-btn cart-item__remove"
              type="button"
              :aria-label="`移除 ${displayName(item.name)}`"
              :disabled="cart.mutating"
              title="移除商品"
              @click="requestItemRemoval(item)"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </article>
      </section>

      <aside class="cart-summary">
        <h2 class="section-title">订单摘要</h2>
        <dl>
          <div>
            <dt>已选商品</dt>
            <dd>{{ selectedCount }} 件</dd>
          </div>
          <div class="cart-summary__total">
            <dt>商品合计</dt>
            <dd>{{ formatCents(cart.selectedTotal) }}</dd>
          </div>
        </dl>
        <button
          class="btn btn--primary btn--full cart-summary__checkout"
          type="button"
          :disabled="selectedCount === 0 || cart.mutating"
          @click="goToCheckout"
        >
          前往结算 <ArrowRight :size="18" />
        </button>
        <p>价格、商品状态与库存将在结算页再次确认。</p>
      </aside>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-label="确认移除"
      :busy="cart.mutating"
      @confirm="confirmRemoval"
      @cancel="cancelRemoval"
    />
  </main>
</template>

<style scoped>
.cart-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-ink);
}

.cart-heading .page-title {
  margin-top: 4px;
}

.cart-heading__count {
  padding-bottom: 6px;
  color: var(--color-muted);
  font-size: 13px;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  gap: 64px;
  margin-top: 32px;
}

.cart-toolbar {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.select-control {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.select-control input,
.cart-item__select input {
  width: 17px;
  height: 17px;
  margin: 0;
  accent-color: var(--color-ink);
}

.cart-toolbar__remove {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 0;
  border: 0;
  background: transparent;
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.cart-toolbar__remove:disabled {
  color: var(--color-disabled);
  text-decoration: none;
}

.cart-list > .status-message {
  margin-top: 16px;
}

.cart-item {
  position: relative;
  display: grid;
  grid-template-columns: 24px 160px minmax(0, 1fr);
  gap: 16px;
  padding-block: 24px;
  border-bottom: 1px solid var(--color-border);
}

.cart-item--unavailable {
  color: var(--color-muted);
}

.cart-item__select {
  padding-top: 3px;
}

.cart-item__image {
  display: grid;
  width: 160px;
  aspect-ratio: 4 / 5;
  place-items: center;
  overflow: hidden;
  background: var(--color-surface);
}

.cart-item__image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.cart-item--unavailable .cart-item__image img {
  opacity: 0.55;
}

.cart-item__details {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto;
  grid-template-rows: auto 1fr auto;
  gap: 20px 24px;
  min-width: 0;
  padding-right: 44px;
}

.cart-item__copy h2 {
  font-size: 16px;
  font-weight: 600;
  line-height: 23px;
}

.cart-item__copy a:hover h2 {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.cart-item__spec {
  margin-top: 6px;
  color: var(--color-muted);
  font-size: 13px;
  line-height: 19px;
}

.cart-item__availability {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  color: var(--color-success);
  font-size: 12px;
}

.cart-item__price {
  display: grid;
  align-content: start;
  justify-items: end;
  gap: 3px;
  white-space: nowrap;
}

.cart-item__price strong,
.cart-item__subtotal strong {
  font-size: 15px;
  font-weight: 700;
}

.cart-item__price span {
  color: var(--color-muted);
  font-size: 12px;
  text-decoration: line-through;
}

.cart-item__quantity {
  display: grid;
  align-self: end;
  gap: 7px;
}

.cart-item__subtotal {
  display: grid;
  align-self: end;
  justify-items: end;
  gap: 7px;
}

.cart-item__remove {
  position: absolute;
  top: -10px;
  right: -8px;
}

.cart-item__remove:disabled {
  color: var(--color-disabled);
}

.cart-summary {
  position: sticky;
  top: calc(var(--header-height) + 32px);
  align-self: start;
  padding-top: 24px;
  border-top: 1px solid var(--color-ink);
}

.cart-summary dl {
  display: grid;
  gap: 14px;
  margin: 28px 0 24px;
}

.cart-summary dl > div {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.cart-summary dd {
  margin: 0;
  font-weight: 600;
}

.cart-summary__total {
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
  font-size: 17px;
}

.cart-summary__checkout {
  min-height: 48px;
}

.cart-summary > p {
  margin-top: 14px;
  color: var(--color-muted);
  font-size: 12px;
  line-height: 18px;
}

.cart-loading {
  display: grid;
  gap: 1px;
  margin-top: 32px;
  background: var(--color-border);
}

.cart-loading__row {
  display: grid;
  grid-template-columns: 176px 1fr;
  gap: 24px;
  min-height: 224px;
  padding: 24px;
  background: var(--color-white);
}

.cart-loading__row span {
  background: var(--color-surface);
}

.cart-error {
  display: grid;
  min-height: 320px;
  place-items: center;
  align-content: center;
  gap: 20px;
  text-align: center;
}

.cart-error p {
  margin-top: 6px;
  color: var(--color-muted);
}

@media (max-width: 1100px) {
  .cart-layout {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 32px;
  }

  .cart-item {
    grid-template-columns: 24px 132px minmax(0, 1fr);
  }

  .cart-item__image {
    width: 132px;
  }

  .cart-item__details {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    gap: 12px;
  }

  .cart-item__price,
  .cart-item__subtotal {
    justify-items: start;
  }

  .cart-item__subtotal {
    grid-template-columns: auto auto;
    justify-content: space-between;
  }
}

@media (max-width: 820px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
    order: -1;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border);
  }
}

@media (max-width: 560px) {
  .cart-heading {
    padding-bottom: 20px;
  }

  .cart-layout {
    gap: 24px;
    margin-top: 24px;
  }

  .cart-toolbar {
    align-items: flex-start;
  }

  .cart-item {
    grid-template-columns: 20px 104px minmax(0, 1fr);
    gap: 12px;
    padding-block: 20px;
  }

  .cart-item__image {
    width: 104px;
  }

  .cart-item__details {
    gap: 10px;
    padding-right: 28px;
  }

  .cart-item__copy h2 {
    font-size: 14px;
    line-height: 20px;
  }

  .cart-item__availability {
    align-items: flex-start;
  }

  .cart-item__quantity :deep(.stepper) {
    width: 108px;
    height: 36px;
    grid-template-columns: repeat(3, 36px);
  }

  .cart-item__remove {
    top: -12px;
    right: -10px;
  }

  .cart-loading__row {
    grid-template-columns: 104px 1fr;
    min-height: 176px;
    padding: 16px 0;
  }
}
</style>
