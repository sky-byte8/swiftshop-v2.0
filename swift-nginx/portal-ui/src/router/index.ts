import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type NavigationGuard,
  type RouteLocation,
  type RouteRecordRaw,
  type RouteRecordRedirectOption,
  type RouterHistory,
} from 'vue-router'

import { isAuthenticated, setReturnUrl } from '@/utils/session'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    requiresAuth?: boolean
    isEntry?: boolean
  }
}

const EntryView = () => import('@/views/EntryView.vue')
const HomeView = () => import('@/views/HomeView.vue')
const SearchView = () => import('@/views/SearchView.vue')
const ProductView = () => import('@/views/ProductView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const CartView = () => import('@/views/CartView.vue')
const CheckoutView = () => import('@/views/CheckoutView.vue')
const PayView = () => import('@/views/PayView.vue')
const PaymentResultView = () => import('@/views/PaymentResultView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

function queryValue(value: RouteLocation['query'][string] | undefined): string | undefined {
  const result = Array.isArray(value) ? value[0] : value
  return result == null ? undefined : String(result)
}

function legacyRedirect(name: string): RouteRecordRedirectOption {
  return (to) => ({
    name,
    query: to.query,
    hash: to.hash,
  })
}

function legacyParamRedirect(
  name: string,
  queryKey: string,
  paramKey: string,
): RouteRecordRedirectOption {
  return (to) => {
    const value = queryValue(to.query[queryKey])

    if (!value) {
      return { name: 'not-found', query: to.query, hash: to.hash }
    }

    return {
      name,
      params: { [paramKey]: value },
      query: to.query,
      hash: to.hash,
    }
  }
}

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'entry', component: EntryView, meta: { title: 'SWIFT', isEntry: true } },
  { path: '/home', name: 'home', component: HomeView, meta: { title: 'SWIFT' } },
  { path: '/search', name: 'search', component: SearchView, meta: { title: '搜索商品' } },
  { path: '/product/:id', name: 'product', component: ProductView, meta: { title: '商品详情' }, props: true },
  { path: '/login', name: 'login', component: LoginView, meta: { title: '登录' } },
  { path: '/cart', name: 'cart', component: CartView, meta: { title: '购物袋', requiresAuth: true } },
  { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { title: '确认订单', requiresAuth: true } },
  { path: '/pay/:orderId', name: 'pay', component: PayView, meta: { title: '订单支付', requiresAuth: true }, props: true },
  {
    path: '/payment-result/:orderId',
    name: 'payment-result',
    component: PaymentResultView,
    meta: { title: '支付结果', requiresAuth: true },
    props: true,
  },
  { path: '/index.html', redirect: legacyRedirect('home') },
  { path: '/search.html', redirect: legacyRedirect('search') },
  { path: '/login.html', redirect: legacyRedirect('login') },
  { path: '/cart.html', redirect: legacyRedirect('cart') },
  { path: '/order-confirm.html', redirect: legacyRedirect('checkout') },
  { path: '/pay.html', redirect: legacyParamRedirect('pay', 'id', 'orderId') },
  {
    path: '/paysuccess.html',
    redirect: legacyParamRedirect('payment-result', 'orderId', 'orderId'),
  },
  { path: '/404', name: 'not-found', component: NotFoundView, meta: { title: '页面未找到' } },
  { path: '/:pathMatch(.*)*', name: 'catch-all', component: NotFoundView, meta: { title: '页面未找到' } },
]

export const authGuard: NavigationGuard = (to) => {
  if (!to.meta.requiresAuth || isAuthenticated()) {
    return true
  }

  setReturnUrl(to.fullPath)
  return { name: 'login', query: { redirect: to.fullPath } }
}

export function createAppRouter(
  history: RouterHistory = typeof window === 'undefined' ? createMemoryHistory() : createWebHistory(),
) {
  const router = createRouter({ history, routes, scrollBehavior: () => ({ top: 0 }) })

  router.beforeEach(authGuard)
  router.afterEach((to) => {
    if (typeof document !== 'undefined') {
      document.title = to.meta.title === 'SWIFT' ? 'SWIFT' : `${to.meta.title} | SWIFT`
    }
  })

  return router
}

export default createAppRouter()
