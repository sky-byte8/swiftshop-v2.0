import type { Page, Route } from '@playwright/test'

export interface MockItem {
  id: string
  name: string
  price: number
  stock: number
  image: string
  category: string
  brand: string
  spec: string
  sold: number
  commentCount: number
  isAD: boolean
  status: number
}

export interface MockCartItem {
  id: string
  itemId: string
  num: number
  name: string
  spec: string
  price: number
  newPrice: number | null
  status: number
  stock: number
  image: string
  createTime: string
}

export interface MockAddress {
  id: string
  province: string
  city: string
  town: string
  mobile: string
  street: string
  contact: string
  isDefault: boolean
  notes?: string
}

export interface MockApiCall {
  method: string
  path: string
  query: Record<string, string>
  body?: Record<string, unknown>
}

export interface MockApiOptions {
  items?: MockItem[]
  cartItems?: MockCartItem[]
  addresses?: MockAddress[]
  orderId?: string
  orderStatus?: number
  payOrderStatus?: number
  paymentOutcome?: 'success' | 'failure'
}

export interface MockApiState {
  calls: MockApiCall[]
  items: MockItem[]
  cartItems: MockCartItem[]
  addresses: MockAddress[]
  order: Record<string, unknown>
  payOrder: Record<string, unknown>
}

const DEFAULT_ITEMS: MockItem[] = [
  {
    id: '1001',
    name: 'Aura 无线降噪耳机',
    price: 129900,
    stock: 18,
    image: '/editorial/category-tech.webp',
    category: '数码科技',
    brand: 'SONORA',
    spec: '{"颜色":"曜石黑","连接":"蓝牙"}',
    sold: 156,
    commentCount: 42,
    isAD: false,
    status: 1,
  },
  {
    id: '1002',
    name: 'Arc 真皮托特包',
    price: 89900,
    stock: 9,
    image: '/editorial/category-style.webp',
    category: '风格穿搭',
    brand: 'MODA',
    spec: '{"材质":"牛皮","颜色":"黑色"}',
    sold: 93,
    commentCount: 18,
    isAD: false,
    status: 1,
  },
  {
    id: '1003',
    name: 'Lumen 便携氛围灯',
    price: 45900,
    stock: 25,
    image: '/editorial/category-home.webp',
    category: '日常生活',
    brand: 'LUMEN',
    spec: '{"色温":"可调","续航":"12小时"}',
    sold: 211,
    commentCount: 67,
    isAD: false,
    status: 1,
  },
  {
    id: '1004',
    name: 'Frame 迷你投影仪',
    price: 239900,
    stock: 6,
    image: '/editorial/category-tech.webp',
    category: '数码科技',
    brand: 'FRAME',
    spec: '{"分辨率":"1080P","颜色":"银色"}',
    sold: 37,
    commentCount: 11,
    isAD: false,
    status: 1,
  },
]

const DEFAULT_ADDRESSES: MockAddress[] = [
  {
    id: '701',
    province: '上海市',
    city: '上海市',
    town: '徐汇区',
    mobile: '13800138000',
    street: '漕溪北路 88 号',
    contact: '陈女士',
    isDefault: true,
    notes: '工作日送达',
  },
]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function cartItemFromItem(item: MockItem): MockCartItem {
  return {
    id: '501',
    itemId: item.id,
    num: 1,
    name: item.name,
    spec: item.spec,
    price: item.price,
    newPrice: null,
    status: item.status,
    stock: item.stock,
    image: item.image,
    createTime: '2026-07-12T12:00:00+08:00',
  }
}

function requestBody(route: Route): Record<string, unknown> {
  try {
    const body = route.request().postDataJSON() as unknown
    return body && typeof body === 'object' && !Array.isArray(body)
      ? body as Record<string, unknown>
      : {}
  } catch {
    return {}
  }
}

async function json(route: Route, body: unknown, status = 200): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(body),
  })
}

export async function setupApiMocks(
  page: Page,
  options: MockApiOptions = {},
): Promise<MockApiState> {
  const orderId = options.orderId ?? '9001'
  const items = clone(options.items ?? DEFAULT_ITEMS)
  const cartItems = clone(options.cartItems ?? [cartItemFromItem(items[0])])
  const addresses = clone(options.addresses ?? DEFAULT_ADDRESSES)
  const state: MockApiState = {
    calls: [],
    items,
    cartItems,
    addresses,
    order: {
      id: orderId,
      totalFee: 129900,
      paymentType: 3,
      userId: '301',
      status: options.orderStatus ?? 1,
      createTime: '2026-07-12T12:10:00+08:00',
    },
    payOrder: {
      id: orderId === '9001' ? '99001' : `99${orderId}`,
      bizOrderNo: orderId,
      payOrderNo: `20260712${orderId}`,
      bizUserId: '301',
      payChannelCode: 'balance',
      amount: 129900,
      payType: 5,
      status: options.payOrderStatus ?? 1,
      payOverTime: '2099-07-12T13:10:00+08:00',
      createTime: '2026-07-12T12:10:00+08:00',
      updateTime: '2026-07-12T12:10:00+08:00',
    },
  }

  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const path = url.pathname.replace(/^\/api/, '') || '/'
    state.calls.push({
      method,
      path,
      query: Object.fromEntries(url.searchParams.entries()),
      body: method === 'POST' || method === 'PUT' ? requestBody(route) : undefined,
    })

    if (method === 'GET' && path === '/search/list') {
      const key = (url.searchParams.get('key') ?? '').trim().toLocaleLowerCase('zh-CN')
      const category = url.searchParams.get('category')
      const brand = url.searchParams.get('brand')
      const minPrice = Number(url.searchParams.get('minPrice') ?? 0)
      const maxPrice = Number(url.searchParams.get('maxPrice') ?? Number.MAX_SAFE_INTEGER)
      const sortBy = url.searchParams.get('sortBy') ?? 'update_time'
      const ascending = url.searchParams.get('isAsc') === 'true'

      const matches = state.items.filter((item) => {
        const haystack = `${item.name} ${item.brand} ${item.category}`.toLocaleLowerCase('zh-CN')
        return (!key || haystack.includes(key))
          && (!category || item.category === category)
          && (!brand || item.brand === brand)
          && item.price >= minPrice
          && item.price <= maxPrice
      })

      if (sortBy === 'price' || sortBy === 'sold') {
        matches.sort((left, right) => {
          const difference = left[sortBy] - right[sortBy]
          return ascending ? difference : -difference
        })
      } else {
        matches.reverse()
      }

      const pageNo = Math.max(1, Number(url.searchParams.get('pageNo') ?? 1))
      const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? 20))
      const start = (pageNo - 1) * pageSize
      return json(route, {
        total: matches.length,
        pages: Math.ceil(matches.length / pageSize),
        list: matches.slice(start, start + pageSize),
      })
    }

    if (method === 'GET' && path === '/search/filters') {
      return json(route, {
        categories: [...new Set(state.items.map((item) => item.category))],
        brands: [...new Set(state.items.map((item) => item.brand))],
      })
    }

    if (method === 'GET' && /^\/items\/[^/]+$/.test(path)) {
      const id = decodeURIComponent(path.split('/').at(-1) ?? '')
      const item = state.items.find((entry) => entry.id === id)
      return item
        ? json(route, item)
        : json(route, { code: 404, msg: '商品不存在' }, 404)
    }

    if (method === 'POST' && path === '/users/login') {
      const body = requestBody(route)
      return json(route, {
        token: 'mock-token',
        userId: '301',
        username: String(body.username ?? 'e2e-user'),
        balance: 500000,
      })
    }

    if (method === 'GET' && path === '/carts') {
      return json(route, state.cartItems)
    }

    if (method === 'POST' && path === '/carts') {
      const body = requestBody(route)
      const item = state.items.find((entry) => entry.id === String(body.itemId ?? ''))
      if (item && !state.cartItems.some((entry) => entry.itemId === item.id)) {
        state.cartItems.push({
          ...cartItemFromItem(item),
          id: String(500 + state.cartItems.length + 1),
          num: Math.max(1, Number(body.num ?? 1)),
        })
      }
      return json(route, null)
    }

    if (method === 'PUT' && path === '/carts') {
      const body = requestBody(route)
      const cartItem = state.cartItems.find((entry) => entry.id === String(body.id ?? ''))
      if (cartItem) cartItem.num = Math.max(1, Number(body.num ?? 1))
      return json(route, null)
    }

    if (method === 'DELETE' && /^\/carts\/[^/]+$/.test(path)) {
      const cartId = decodeURIComponent(path.split('/').at(-1) ?? '')
      state.cartItems.splice(0, state.cartItems.length, ...state.cartItems.filter((item) => item.id !== cartId))
      return json(route, null)
    }

    if (method === 'DELETE' && path === '/carts') {
      const ids = new Set(url.searchParams.getAll('ids'))
      state.cartItems.splice(0, state.cartItems.length, ...state.cartItems.filter((item) => !ids.has(item.itemId)))
      return json(route, null)
    }

    if (method === 'GET' && path === '/addresses') {
      return json(route, state.addresses)
    }

    if (method === 'POST' && path === '/orders') {
      return json(route, orderId)
    }

    if (method === 'GET' && /^\/orders\/[^/]+$/.test(path)) {
      return json(route, state.order)
    }

    if (method === 'POST' && path === '/pay-orders') {
      return json(route, state.payOrder.id)
    }

    if (method === 'GET' && /^\/pay-orders\/biz\/[^/]+$/.test(path)) {
      return json(route, state.payOrder)
    }

    if (method === 'POST' && /^\/pay-orders\/[^/]+$/.test(path)) {
      if (options.paymentOutcome === 'failure') {
        return json(route, { code: 'INVALID_PASSWORD', msg: '支付密码错误' }, 400)
      }

      state.order.status = 2
      state.order.payTime = '2026-07-12T12:12:00+08:00'
      state.payOrder.status = 3
      state.payOrder.paySuccessTime = '2026-07-12T12:12:00+08:00'
      state.payOrder.updateTime = '2026-07-12T12:12:00+08:00'
      return json(route, null)
    }

    return json(route, { code: 404, msg: `E2E mock 未覆盖 ${method} ${path}` }, 404)
  })

  return state
}
