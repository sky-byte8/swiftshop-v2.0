<script setup lang="ts">
import { LogOut, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useNotice } from '@/composables/useNotice'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const notice = useNotice()

const keyword = ref('')
const menuOpen = ref(false)
const accountLabel = computed(() => auth.user?.username || '登录')

const navigation = [
  { label: '新品', query: { sortBy: 'update_time' } },
  { label: '手机数码', query: { key: '手机' } },
  { label: '日常生活', query: { key: '牛奶' } },
  { label: '风格穿搭', query: { key: '真皮包' } },
  { label: '旅行箱包', query: { key: '拉杆箱' } },
  { label: '鞋履', query: { key: '休闲鞋' } },
]

watch(
  () => route.query.key,
  (value) => {
    keyword.value = typeof value === 'string' ? value : ''
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

watch(
  () => auth.isAuthenticated,
  (authenticated) => {
    if (authenticated) void cart.load().catch(() => undefined)
    else cart.$reset()
  },
)

onMounted(() => {
  if (auth.isAuthenticated && cart.items.length === 0) {
    void cart.load().catch(() => undefined)
  }
})

function submitSearch() {
  const key = keyword.value.trim()
  void router.push({ name: 'search', query: key ? { key } : {} })
}

function openAccount() {
  if (!auth.isAuthenticated) {
    void router.push({ name: 'login', query: { redirect: route.fullPath } })
  }
}

function logout() {
  auth.logout()
  cart.$reset()
  notice.success('已退出登录')
  void router.push({ name: 'home' })
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__main container">
      <button class="icon-btn site-header__menu" type="button" :aria-expanded="menuOpen" aria-label="打开菜单" @click="menuOpen = !menuOpen">
        <X v-if="menuOpen" :size="22" />
        <Menu v-else :size="22" />
      </button>

      <nav class="audience-nav" aria-label="主要栏目">
        <RouterLink to="/search?key=女装">风格</RouterLink>
        <RouterLink to="/search?key=手机">数码</RouterLink>
        <RouterLink to="/search?key=牛奶">日常</RouterLink>
      </nav>

      <RouterLink class="wordmark" :to="{ name: 'home' }" aria-label="SwiftShop 首页">SWIFTSHOP</RouterLink>

      <div class="header-actions">
        <button class="account-action" type="button" @click="openAccount">
          <UserRound :size="21" aria-hidden="true" />
          <span>{{ accountLabel }}</span>
        </button>
        <button v-if="auth.isAuthenticated" class="icon-btn logout-action" type="button" title="退出登录" aria-label="退出登录" @click="logout">
          <LogOut :size="19" />
        </button>
        <RouterLink class="icon-btn cart-action" :to="{ name: 'cart' }" aria-label="购物袋">
          <ShoppingBag :size="22" />
          <span v-if="cart.itemCount" class="cart-badge">{{ cart.itemCount > 99 ? '99+' : cart.itemCount }}</span>
        </RouterLink>
      </div>
    </div>

    <div class="site-header__sub container">
      <nav class="category-nav" aria-label="商品分类">
        <RouterLink v-for="item in navigation" :key="item.label" :to="{ name: 'search', query: item.query }">
          {{ item.label }}
        </RouterLink>
      </nav>
      <form class="header-search" role="search" @submit.prevent="submitSearch">
        <Search :size="20" aria-hidden="true" />
        <input v-model="keyword" type="search" aria-label="搜索商品" placeholder="搜索品牌或商品" />
        <button type="submit">搜索</button>
      </form>
    </div>

    <Transition name="fade">
      <div v-if="menuOpen" class="mobile-menu">
        <nav class="mobile-menu__links" aria-label="移动端菜单">
          <RouterLink :to="{ name: 'home' }">首页</RouterLink>
          <RouterLink v-for="item in navigation" :key="item.label" :to="{ name: 'search', query: item.query }">
            {{ item.label }}
          </RouterLink>
          <RouterLink :to="{ name: 'cart' }">购物袋</RouterLink>
        </nav>
        <button v-if="auth.isAuthenticated" class="btn btn--secondary btn--full" type="button" @click="logout">退出登录</button>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 100;
  top: 0;
  height: var(--header-height);
  border-bottom: 1px solid #e6e6e6;
  background: #ffffff;
}

.site-header__main {
  position: relative;
  display: grid;
  height: 52px;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.audience-nav,
.category-nav,
.header-actions {
  display: flex;
  align-items: center;
}

.audience-nav {
  gap: 26px;
  font-size: 15px;
}

.audience-nav a {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  padding: 6px 10px;
  transition: background-color 160ms ease, color 160ms ease, font-weight 160ms ease;
}

.audience-nav a:hover,
.audience-nav a:focus-visible {
  color: #000000;
  background: #f5f5f5;
  font-weight: 600;
}

.wordmark {
  font-size: 22px;
  font-weight: 700;
  line-height: 28px;
}

.header-actions {
  justify-content: flex-end;
  gap: 2px;
}

.account-action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  font-size: 14px;
}

.account-action:hover {
  background: #f5f5f5;
}

.cart-action {
  overflow: visible;
}

.cart-badge {
  position: absolute;
  top: 2px;
  right: 0;
  display: grid;
  min-width: 18px;
  height: 18px;
  place-items: center;
  padding: 0 4px;
  border-radius: 9px;
  color: #ffffff;
  background: #e71d34;
  font-size: 10px;
  font-weight: 700;
  line-height: 18px;
}

.site-header__sub {
  display: flex;
  height: 84px;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.category-nav {
  height: 36px;
  gap: 26px;
  font-size: 15px;
  white-space: nowrap;
}

.category-nav a {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  padding: 4px 0;
}

.category-nav a:hover,
.category-nav a:focus-visible {
  text-decoration: underline;
  text-underline-offset: 5px;
}

.category-nav a:first-child {
  color: #e71d34;
}

.header-search {
  display: grid;
  width: min(100%, 440px);
  height: 40px;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  align-self: center;
  border-bottom: 1px solid #727272;
}

.header-search input {
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0 8px;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 14px;
}

.header-search button {
  height: 38px;
  padding: 0 2px 0 8px;
  border: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
}

.site-header__menu,
.mobile-menu {
  display: none;
}

@media (max-width: 900px) {
  .site-header {
    height: 100px;
  }

  .site-header__main {
    height: 56px;
    grid-template-columns: 44px 1fr auto;
    padding-inline: 12px;
  }

  .site-header__menu {
    display: grid;
  }

  .audience-nav,
  .category-nav,
  .account-action span,
  .logout-action {
    display: none;
  }

  .wordmark {
    justify-self: center;
    font-size: 18px;
  }

  .site-header__sub {
    display: block;
    height: 44px;
    padding-inline: 16px;
  }

  .header-search {
    width: 100%;
    align-self: auto;
    height: 40px;
    grid-template-columns: 24px 1fr auto;
    border: 1px solid #e6e6e6;
    padding-inline: 10px;
    background: #f5f5f5;
  }

  .mobile-menu {
    position: fixed;
    z-index: 101;
    top: 100px;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    overflow-y: auto;
    padding: 24px 16px 40px;
    background: #ffffff;
  }

  .mobile-menu__links {
    display: grid;
    margin-bottom: 32px;
  }

  .mobile-menu__links a {
    display: flex;
    min-height: 52px;
    align-items: center;
    border-bottom: 1px solid #e6e6e6;
    font-size: 16px;
  }
}
</style>
