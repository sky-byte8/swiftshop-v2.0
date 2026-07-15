<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { computed, onMounted } from 'vue'

import ProductCard from '@/components/ProductCard.vue'
import ProductSkeleton from '@/components/ProductSkeleton.vue'
import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()

const heroFallback = computed(() => catalog.latest[0]?.image || '')
const categories = computed(() => [
  { label: '数码科技', description: '探索连接生活的新选择', query: '手机', asset: '/editorial/category-tech.webp', fallback: catalog.latest[1]?.image },
  { label: '日常生活', description: '为每天的生活补充新意', query: '牛奶', asset: '/editorial/category-home.webp', fallback: catalog.latest[2]?.image },
  { label: '风格穿搭', description: '从细节定义个人风格', query: '真皮包', asset: '/editorial/category-style.webp', fallback: catalog.latest[3]?.image },
])

onMounted(() => {
  if (catalog.latest.length === 0) void catalog.loadLatest(12).catch(() => undefined)
})

function imageFallback(event: Event, fallback?: string) {
  const image = event.currentTarget as HTMLImageElement
  if (fallback && image.src !== fallback) image.src = fallback
}
</script>

<template>
  <div class="home-page">
    <section class="hero" aria-labelledby="home-hero-title">
      <picture>
        <source media="(max-width: 767px)" srcset="/editorial/hero-mobile.webp" />
        <img
          class="hero__image"
          src="/editorial/hero-desktop.webp"
          alt="SwiftShop 当季精选"
          @error="imageFallback($event, heroFallback)"
        />
      </picture>
      <div class="hero__veil" aria-hidden="true"></div>
      <div class="hero__content container">
        <p class="hero__eyebrow">SWIFTSHOP EDIT</p>
        <h1 id="home-hero-title">重新发现<br />日常好物</h1>
        <p>从风格穿搭到生活科技，精选值得长久使用的选择。</p>
        <RouterLink class="btn hero__action" :to="{ name: 'search', query: { sortBy: 'update_time' } }">
          浏览新品 <ArrowRight :size="18" />
        </RouterLink>
      </div>
    </section>

    <section class="category-section container" aria-labelledby="category-title">
      <div class="section-heading">
        <h2 id="category-title" class="section-title">按生活方式探索</h2>
      </div>
      <div class="category-grid">
        <article v-for="category in categories" :key="category.label" class="category-tile">
          <RouterLink :to="{ name: 'search', query: { key: category.query } }">
            <img
              :src="category.asset"
              :alt="category.label"
              loading="lazy"
              @error="imageFallback($event, category.fallback)"
            />
            <div class="category-tile__veil" aria-hidden="true"></div>
            <div class="category-tile__content">
              <h3>{{ category.label }}</h3>
              <p>{{ category.description }}</p>
              <span>去逛逛 <ArrowRight :size="16" /></span>
            </div>
          </RouterLink>
        </article>
      </div>
    </section>

    <section class="product-section container" aria-labelledby="latest-title">
      <div class="section-heading section-heading--split">
        <div>
          <p class="eyebrow">NEW IN</p>
          <h2 id="latest-title" class="section-title">新品上架</h2>
        </div>
        <RouterLink class="section-link" :to="{ name: 'search', query: { sortBy: 'update_time' } }">
          查看全部 <ArrowRight :size="16" />
        </RouterLink>
      </div>

      <div v-if="catalog.loading && catalog.latest.length === 0" class="product-grid">
        <ProductSkeleton v-for="index in 8" :key="index" />
      </div>
      <div v-else-if="catalog.latest.length" class="product-grid">
        <ProductCard v-for="item in catalog.latest.slice(0, 8)" :key="item.id" :item="item" />
      </div>
      <div v-else class="home-error">
        <p>{{ catalog.error || '新品暂时无法加载' }}</p>
        <button class="btn btn--secondary" type="button" @click="catalog.loadLatest(12)">重新加载</button>
      </div>
    </section>

    <section v-if="catalog.latest.length > 8" class="edit-band">
      <div class="container edit-band__inner">
        <div class="edit-band__copy">
          <p class="eyebrow">THE WEEKLY EDIT</p>
          <h2>本周精选</h2>
          <p>从真实库存中发现更多当季单品，每一次刷新都有新的灵感。</p>
          <RouterLink class="btn btn--secondary" :to="{ name: 'search', query: { sortBy: 'sold', isAsc: 'false' } }">探索人气好物</RouterLink>
        </div>
        <div class="edit-band__products">
          <ProductCard v-for="item in catalog.latest.slice(8, 12)" :key="item.id" :item="item" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: 96px;
}

.hero {
  position: relative;
  min-height: 480px;
  height: min(620px, calc(100svh - var(--header-height) - 96px));
  overflow: hidden;
  color: #ffffff;
  background: #222222;
}

.hero picture,
.hero__image,
.hero__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero__image {
  object-fit: cover;
  object-position: center;
}

.hero__veil {
  background: rgba(0, 0, 0, 0.32);
}

.hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  max-width: 760px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  margin-left: max(0px, calc((100% - var(--container)) / 2));
  text-shadow: 0 1px 16px rgba(0, 0, 0, 0.36);
}

.hero__eyebrow {
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
}

.hero h1 {
  font-size: 48px;
  line-height: 56px;
}

.hero__content > p:not(.hero__eyebrow) {
  max-width: 520px;
  font-size: 17px;
  line-height: 26px;
}

.hero__action {
  margin-top: 8px;
  color: #222222;
  background: #ffffff;
  text-shadow: none;
}

.category-section,
.product-section {
  padding-top: 64px;
}

.section-heading {
  margin-bottom: 24px;
}

.section-heading--split {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}

.section-heading .eyebrow {
  margin-bottom: 4px;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-block: 8px;
  text-decoration: underline;
  text-underline-offset: 5px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.category-tile {
  position: relative;
  min-width: 0;
  overflow: hidden;
  background: #222222;
}

.category-tile a {
  position: relative;
  display: block;
  aspect-ratio: 4 / 5;
}

.category-tile img,
.category-tile__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.category-tile img {
  object-fit: cover;
  transition: transform 300ms ease;
}

.category-tile:hover img {
  transform: scale(1.02);
}

.category-tile__veil {
  background: rgba(0, 0, 0, 0.28);
}

.category-tile__content {
  position: absolute;
  z-index: 1;
  right: 24px;
  bottom: 28px;
  left: 24px;
  color: #ffffff;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.4);
}

.category-tile h3 {
  font-size: 28px;
  line-height: 36px;
}

.category-tile p {
  margin-top: 8px;
}

.category-tile span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 5px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 48px 16px;
}

.home-error {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #727272;
}

.edit-band {
  margin-top: 96px;
  padding-block: 64px;
  background: #f5f5f5;
}

.edit-band__inner {
  display: grid;
  grid-template-columns: minmax(240px, 0.75fr) 2fr;
  align-items: center;
  gap: 64px;
}

.edit-band__copy {
  display: grid;
  justify-items: start;
  gap: 20px;
}

.edit-band__copy h2 {
  font-size: 30px;
  line-height: 40px;
}

.edit-band__copy p:not(.eyebrow) {
  color: #727272;
}

.edit-band__products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1023px) {
  .product-grid,
  .edit-band__products {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .edit-band__inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 767px) {
  .home-page {
    padding-bottom: 64px;
  }

  .hero {
    min-height: 480px;
    height: calc(100svh - var(--header-height) - 100px);
    max-height: 600px;
  }

  .hero__content {
    justify-content: flex-end;
    gap: 16px;
    padding-bottom: 48px;
    margin-left: 0;
  }

  .hero h1 {
    font-size: 34px;
    line-height: 42px;
  }

  .hero__content > p:not(.hero__eyebrow) {
    font-size: 15px;
    line-height: 22px;
  }

  .category-section,
  .product-section {
    padding-top: 56px;
  }

  .category-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-tile a {
    aspect-ratio: 4 / 3;
  }

  .category-tile h3 {
    font-size: 24px;
    line-height: 32px;
  }

  .category-tile__content {
    right: 20px;
    bottom: 20px;
    left: 20px;
  }

  .product-grid {
    gap: 36px 10px;
  }

  .section-heading--split {
    align-items: center;
  }

  .edit-band {
    margin-top: 64px;
    padding-block: 48px;
  }
}
</style>
