<script setup lang="ts">
import { ArrowLeft, Check, PackageCheck, ShoppingBag } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/EmptyState.vue'
import { useNotice } from '@/composables/useNotice'
import { getItem } from '@/services/catalog'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { Item } from '@/types'
import { formatCents } from '@/utils/money'
import { parseSpec } from '@/utils/spec'
import { setReturnUrl } from '@/utils/session'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const notice = useNotice()

const item = ref<Item | null>(null)
const loading = ref(true)
const error = ref('')
const imageLoaded = ref(false)

const displayName = computed(() => item.value?.name.replace(/^test\s*/i, '').trim() || '')
const specs = computed(() => Object.entries(parseSpec(item.value?.spec)))
const available = computed(() => Boolean(item.value && item.value.status === 1 && item.value.stock > 0))

async function load() {
  loading.value = true
  error.value = ''
  item.value = null
  imageLoaded.value = false
  try {
    item.value = await getItem(String(route.params.id))
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : '商品加载失败'
  } finally {
    loading.value = false
  }
}

async function addToCart() {
  if (!item.value || !available.value) return
  if (!auth.isAuthenticated) {
    setReturnUrl(route.fullPath)
    await router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  try {
    await cart.add({
      itemId: item.value.id,
      num: 1,
      name: item.value.name,
      spec: item.value.spec,
      price: item.value.price,
      image: item.value.image,
    })
    notice.success('商品已加入购物袋')
  } catch (caught) {
    notice.error(caught instanceof Error ? caught.message : '加入购物袋失败')
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <div class="product-page page-shell container">
    <button class="product-page__back" type="button" @click="router.back()"><ArrowLeft :size="17" /> 返回</button>

    <div v-if="loading" class="product-loading">
      <div class="product-loading__image"></div>
      <div class="product-loading__copy"></div>
    </div>

    <EmptyState v-else-if="error || !item" title="商品暂时无法查看" :description="error" action-label="返回选购" @action="router.push({ name: 'search' })" />

    <article v-else class="product-detail">
      <div class="product-gallery">
        <div class="product-gallery__stage" :class="{ loaded: imageLoaded }">
          <img :src="item.image" :alt="displayName" @load="imageLoaded = true" />
        </div>
      </div>

      <div class="product-info">
        <div class="product-info__heading">
          <p class="product-info__brand">{{ item.brand || item.category || 'SwiftShop' }}</p>
          <h1>{{ displayName }}</h1>
          <p class="product-info__price">{{ formatCents(item.price) }}</p>
          <p class="product-info__tax">价格已包含税费</p>
        </div>

        <div v-if="specs.length" class="spec-list">
          <h2>商品规格</h2>
          <dl>
            <div v-for="([key, value]) in specs" :key="key">
              <dt>{{ key }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>
        </div>

        <div class="stock-line" :class="{ 'stock-line--unavailable': !available }">
          <Check v-if="available" :size="17" />
          <PackageCheck v-else :size="17" />
          <span>{{ available ? `有货 · 库存 ${item.stock} 件` : '暂时缺货' }}</span>
        </div>

        <button class="btn btn--primary btn--full product-info__cart" type="button" :disabled="!available || cart.mutating" @click="addToCart">
          <ShoppingBag :size="18" />
          {{ cart.mutating ? '正在加入...' : '加入购物袋' }}
        </button>

        <div class="detail-notes">
          <section>
            <h2>商品信息</h2>
            <p>分类：{{ item.category || '未分类' }}</p>
            <p>商品编号：{{ item.id }}</p>
          </section>
          <section>
            <h2>购买说明</h2>
            <p>库存与价格来自 SwiftShop 实时商品服务，结算前会再次校验。</p>
          </section>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.product-page__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  font-size: 13px;
}

.product-page__back:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.product-detail,
.product-loading {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(400px, 0.85fr);
  gap: 64px;
}

.product-gallery__stage,
.product-loading__image {
  display: grid;
  min-height: 680px;
  place-items: center;
  background: #f5f5f5;
}

.product-gallery__stage img {
  width: 100%;
  height: min(760px, 72vw);
  object-fit: contain;
  mix-blend-mode: multiply;
  opacity: 0;
  transition: opacity 200ms ease;
}

.product-gallery__stage.loaded img {
  opacity: 1;
}

.product-info {
  position: sticky;
  top: calc(var(--header-height) + 32px);
  align-self: start;
}

.product-info__heading {
  padding-bottom: 28px;
  border-bottom: 1px solid #e6e6e6;
}

.product-info__brand {
  font-size: 22px;
  line-height: 28px;
}

.product-info h1 {
  margin-top: 4px;
  color: #727272;
  font-size: 15px;
  line-height: 22px;
}

.product-info__price {
  margin-top: 20px;
  font-size: 17px;
  font-weight: 700;
  line-height: 24px;
}

.product-info__tax {
  margin-top: 3px;
  color: #727272;
  font-size: 12px;
}

.spec-list {
  padding-block: 24px;
  border-bottom: 1px solid #e6e6e6;
}

.spec-list h2,
.detail-notes h2 {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
}

.spec-list dl {
  display: grid;
  gap: 8px;
}

.spec-list dl > div {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 16px;
}

.spec-list dt {
  color: #727272;
}

.spec-list dd {
  margin: 0;
}

.stock-line {
  display: flex;
  min-height: 52px;
  align-items: center;
  gap: 10px;
  color: #18794e;
  font-size: 13px;
}

.stock-line--unavailable {
  color: #e71d34;
}

.product-info__cart {
  min-height: 48px;
}

.detail-notes {
  display: grid;
  margin-top: 28px;
  border-top: 1px solid #e6e6e6;
}

.detail-notes section {
  padding-block: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.detail-notes p {
  color: #727272;
  font-size: 13px;
  line-height: 20px;
}

.product-loading__image,
.product-loading__copy {
  min-height: 680px;
  background: #f5f5f5;
}

.product-loading__copy {
  min-height: 460px;
}

@media (max-width: 900px) {
  .product-detail,
  .product-loading {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .product-info {
    position: static;
  }

  .product-gallery__stage,
  .product-loading__image {
    min-height: 480px;
  }

  .product-gallery__stage img {
    height: 62vw;
    min-height: 440px;
  }
}

@media (max-width: 600px) {
  .product-page {
    padding-top: 20px;
  }

  .product-page__back {
    margin-bottom: 12px;
  }

  .product-gallery {
    margin-inline: calc(var(--gutter) * -1);
  }

  .product-gallery__stage,
  .product-loading__image {
    min-height: 430px;
  }

  .product-gallery__stage img {
    height: 112vw;
    max-height: 520px;
    min-height: 400px;
  }
}
</style>
