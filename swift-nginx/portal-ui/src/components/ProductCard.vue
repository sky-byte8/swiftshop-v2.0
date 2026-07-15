<script setup lang="ts">
import { computed } from 'vue'

import type { Item } from '@/types'
import { formatCents } from '@/utils/money'

const props = defineProps<{
  item: Item
}>()

const displayName = computed(() => props.item.name.replace(/^test\s*/i, '').trim())
const available = computed(() => props.item.status === 1 && props.item.stock > 0)
</script>

<template>
  <article class="product-card">
    <RouterLink class="product-card__link" :to="{ name: 'product', params: { id: item.id } }" :aria-label="displayName">
      <div class="product-card__media">
        <img :src="item.image" :alt="displayName" loading="lazy" decoding="async" />
        <span v-if="!available" class="product-card__status">暂时缺货</span>
      </div>
      <div class="product-card__body">
        <p class="product-card__brand">{{ item.brand || item.category || 'SwiftShop' }}</p>
        <h3 class="product-card__name">{{ displayName }}</h3>
        <p class="product-card__price">{{ formatCents(item.price) }}</p>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.product-card {
  min-width: 0;
}

.product-card__link {
  display: grid;
  gap: 14px;
}

.product-card__media {
  position: relative;
  display: grid;
  aspect-ratio: 3 / 4;
  place-items: center;
  overflow: hidden;
  background: #f5f5f5;
}

.product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  transition: transform 260ms ease;
}

.product-card__link:hover img {
  transform: scale(1.025);
}

.product-card__status {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 5px 8px;
  color: #ffffff;
  background: #222222;
  font-size: 12px;
}

.product-card__body {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.product-card__brand {
  min-height: 18px;
  font-size: 13px;
  line-height: 18px;
}

.product-card__name {
  display: -webkit-box;
  min-height: 40px;
  overflow: hidden;
  color: #727272;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card__price {
  min-height: 20px;
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

@media (max-width: 767px) {
  .product-card__link {
    gap: 10px;
  }

  .product-card__media {
    aspect-ratio: 4 / 5;
  }
}
</style>
