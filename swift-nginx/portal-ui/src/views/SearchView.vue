<script setup lang="ts">
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/EmptyState.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductSkeleton from '@/components/ProductSkeleton.vue'
import { useCatalogStore } from '@/stores/catalog'
import type { SearchParams, SearchSortField } from '@/types'

const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const filtersOpen = ref(false)

const priceRanges = [
  { label: '¥300 以下', minPrice: 0, maxPrice: 30000 },
  { label: '¥300 - ¥800', minPrice: 30000, maxPrice: 80000 },
  { label: '¥800 - ¥1,600', minPrice: 80000, maxPrice: 160000 },
  { label: '¥1,600 以上', minPrice: 160000, maxPrice: 99999999 },
]

const sortValue = computed({
  get() {
    const sortBy = catalog.query.sortBy || 'update_time'
    return sortBy === 'price' ? `price:${catalog.query.isAsc ? 'asc' : 'desc'}` : `${sortBy}:desc`
  },
  set(value: string) {
    const [sortBy, direction] = value.split(':') as [SearchSortField, string]
    updateQuery({ sortBy, isAsc: direction === 'asc', pageNo: 1 })
  },
})

const title = computed(() => catalog.query.key ? `“${catalog.query.key}” 的搜索结果` : '全部商品')
const activeCount = computed(() => [catalog.query.category, catalog.query.brand, catalog.query.minPrice != null ? 'price' : ''].filter(Boolean).length)
const currentPage = computed(() => catalog.query.pageNo || 1)

function first(value: unknown): string | undefined {
  return Array.isArray(value) ? String(value[0] ?? '') : typeof value === 'string' ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  const parsed = Number(first(value))
  return Number.isFinite(parsed) ? parsed : undefined
}

function routeParams(): SearchParams {
  const sortBy = first(route.query.sortBy)
  return {
    key: first(route.query.key),
    category: first(route.query.category),
    brand: first(route.query.brand),
    minPrice: numberValue(route.query.minPrice),
    maxPrice: numberValue(route.query.maxPrice),
    pageNo: Math.max(1, numberValue(route.query.page) || 1),
    pageSize: 20,
    sortBy: sortBy === 'price' || sortBy === 'sold' ? sortBy : 'update_time',
    isAsc: first(route.query.isAsc) === 'true',
  }
}

function serialise(params: SearchParams) {
  const query: Record<string, string> = {}
  if (params.key) query.key = params.key
  if (params.category) query.category = params.category
  if (params.brand) query.brand = params.brand
  if (params.minPrice != null) query.minPrice = String(params.minPrice)
  if (params.maxPrice != null) query.maxPrice = String(params.maxPrice)
  if ((params.pageNo || 1) > 1) query.page = String(params.pageNo)
  if (params.sortBy && params.sortBy !== 'update_time') query.sortBy = params.sortBy
  if (params.isAsc) query.isAsc = 'true'
  return query
}

function updateQuery(patch: Partial<SearchParams>) {
  const next = { ...routeParams(), ...patch }
  void router.push({ name: 'search', query: serialise(next) })
  filtersOpen.value = false
}

function setPrice(minPrice: number, maxPrice: number) {
  updateQuery({ minPrice, maxPrice, pageNo: 1 })
}

function clearFilters() {
  updateQuery({ category: undefined, brand: undefined, minPrice: undefined, maxPrice: undefined, pageNo: 1 })
}

async function load() {
  const params = routeParams()
  await Promise.allSettled([
    catalog.search(params),
    catalog.loadFilters(params.key || ''),
  ])
}

watch(() => route.fullPath, load, { immediate: true })
</script>

<template>
  <div class="search-page page-shell container">
    <div class="search-heading">
      <div>
        <p class="eyebrow">SWIFTSHOP SELECTION</p>
        <h1 class="page-title">{{ title }}</h1>
        <p class="search-heading__count">{{ catalog.total.toLocaleString('zh-CN') }} 件商品</p>
      </div>
      <div class="search-tools">
        <button class="btn btn--secondary filter-trigger" type="button" @click="filtersOpen = true">
          <SlidersHorizontal :size="18" /> 筛选<span v-if="activeCount">（{{ activeCount }}）</span>
        </button>
        <label class="sort-field">
          <span>排序</span>
          <select v-model="sortValue" aria-label="商品排序">
            <option value="update_time:desc">最新上架</option>
            <option value="sold:desc">人气优先</option>
            <option value="price:asc">价格从低到高</option>
            <option value="price:desc">价格从高到低</option>
          </select>
        </label>
      </div>
    </div>

    <div class="search-layout">
      <aside class="filters" :class="{ 'filters--open': filtersOpen }" aria-label="商品筛选">
        <div class="filters__mobile-head">
          <h2 class="section-title">筛选</h2>
          <button class="icon-btn" type="button" aria-label="关闭筛选" @click="filtersOpen = false"><X :size="22" /></button>
        </div>

        <div class="filter-group">
          <h2>分类</h2>
          <div class="filter-options">
            <button
              v-for="category in catalog.filters.categories"
              :key="category"
              type="button"
              :class="{ active: catalog.query.category === category }"
              @click="updateQuery({ category: catalog.query.category === category ? undefined : category, pageNo: 1 })"
            >{{ category }}</button>
            <p v-if="!catalog.filtersLoading && !catalog.filters.categories.length" class="filter-empty">暂无分类选项</p>
          </div>
        </div>

        <div class="filter-group">
          <h2>品牌</h2>
          <div class="filter-options">
            <button
              v-for="brand in catalog.filters.brands"
              :key="brand"
              type="button"
              :class="{ active: catalog.query.brand === brand }"
              @click="updateQuery({ brand: catalog.query.brand === brand ? undefined : brand, pageNo: 1 })"
            >{{ brand }}</button>
            <p v-if="!catalog.filtersLoading && !catalog.filters.brands.length" class="filter-empty">暂无品牌选项</p>
          </div>
        </div>

        <div class="filter-group">
          <h2>价格</h2>
          <div class="filter-options">
            <button
              v-for="range in priceRanges"
              :key="range.label"
              type="button"
              :class="{ active: catalog.query.minPrice === range.minPrice && catalog.query.maxPrice === range.maxPrice }"
              @click="setPrice(range.minPrice, range.maxPrice)"
            >{{ range.label }}</button>
          </div>
        </div>

        <button v-if="activeCount" class="btn btn--secondary btn--full filters__clear" type="button" @click="clearFilters">清除筛选</button>
      </aside>
      <div v-if="filtersOpen" class="filters-backdrop" aria-hidden="true" @click="filtersOpen = false"></div>

      <main class="results">
        <div v-if="catalog.loading" class="results-grid">
          <ProductSkeleton v-for="index in 12" :key="index" />
        </div>
        <div v-else-if="catalog.error && !catalog.items.length" class="result-state">
          <EmptyState title="商品加载失败" :description="catalog.error" action-label="重新加载" @action="load" />
        </div>
        <div v-else-if="!catalog.items.length" class="result-state">
          <EmptyState title="没有找到相关商品" description="调整搜索词或筛选条件后再试一次。" action-label="清除筛选" @action="clearFilters" />
        </div>
        <div v-else class="results-grid">
          <ProductCard v-for="item in catalog.items" :key="item.id" :item="item" />
        </div>

        <nav v-if="catalog.pages > 1" class="pagination" aria-label="分页">
          <button class="icon-btn" type="button" aria-label="上一页" :disabled="currentPage <= 1" @click="updateQuery({ pageNo: currentPage - 1 })">
            <ChevronLeft :size="20" />
          </button>
          <span>第 {{ currentPage }} / {{ catalog.pages }} 页</span>
          <button class="icon-btn" type="button" aria-label="下一页" :disabled="currentPage >= catalog.pages" @click="updateQuery({ pageNo: currentPage + 1 })">
            <ChevronRight :size="20" />
          </button>
        </nav>
      </main>
    </div>
  </div>
</template>

<style scoped>
.search-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e6e6e6;
}

.search-heading .eyebrow {
  margin-bottom: 6px;
}

.search-heading__count {
  margin-top: 8px;
  color: #727272;
  font-size: 13px;
}

.search-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-trigger {
  display: none;
}

.sort-field {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 12px;
  padding-left: 16px;
  border: 1px solid #e6e6e6;
  font-size: 13px;
}

.sort-field span {
  color: #727272;
}

.sort-field select {
  min-width: 160px;
  height: 42px;
  padding-inline: 4px 36px;
  border: 0;
  outline: 0;
  background: #ffffff;
}

.search-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 40px;
  padding-top: 32px;
}

.filters {
  min-width: 0;
}

.filters__mobile-head,
.filters-backdrop {
  display: none;
}

.filter-group {
  padding-block: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.filter-group:first-of-type {
  padding-top: 0;
}

.filter-group h2 {
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
}

.filter-options {
  display: grid;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
}

.filter-options button {
  width: 100%;
  min-height: 36px;
  padding: 7px 8px;
  border: 0;
  color: #727272;
  background: transparent;
  text-align: left;
}

.filter-options button:hover,
.filter-options button.active {
  color: #222222;
  background: #f5f5f5;
}

.filter-options button.active {
  font-weight: 600;
}

.filter-empty {
  padding: 8px;
  color: #727272;
  font-size: 13px;
}

.filters__clear {
  margin-top: 24px;
}

.results,
.result-state {
  min-width: 0;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 48px 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 64px;
  font-size: 13px;
}

.pagination .icon-btn {
  border: 1px solid #e6e6e6;
}

.pagination .icon-btn:disabled {
  color: #b6b6b6;
}

@media (max-width: 1100px) {
  .results-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .search-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-tools {
    width: 100%;
  }

  .filter-trigger {
    display: inline-flex;
  }

  .sort-field {
    flex: 1;
  }

  .sort-field select {
    width: 100%;
    min-width: 0;
  }

  .search-layout {
    display: block;
  }

  .filters {
    position: fixed;
    z-index: 501;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(420px, 92vw);
    overflow-y: auto;
    padding: 24px;
    background: #ffffff;
    transform: translateX(105%);
    transition: transform 180ms ease;
  }

  .filters--open {
    transform: translateX(0);
  }

  .filters__mobile-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .filters-backdrop {
    position: fixed;
    z-index: 500;
    inset: 0;
    display: block;
    background: rgba(0, 0, 0, 0.42);
  }
}

@media (max-width: 640px) {
  .search-heading {
    gap: 24px;
  }

  .search-tools {
    align-items: stretch;
    flex-direction: column;
  }

  .sort-field {
    width: 100%;
  }

  .results-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 36px 10px;
  }
}
</style>
