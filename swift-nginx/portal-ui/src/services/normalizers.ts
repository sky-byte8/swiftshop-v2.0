import type {
  Address,
  CartItem,
  Item,
  LoginResult,
  Order,
  PageResult,
  PayOrder,
  SearchFilters,
} from '@/types'
import { normalizeId } from '@/utils/id'

export function asRecord(value: unknown, name = 'response'): Record<string, unknown> {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new TypeError(`${name} must be an object`)
  }
  return value as Record<string, unknown>
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function number(value: unknown, fallback = 0): number {
  const result = Number(value)
  return Number.isFinite(result) ? result : fallback
}

function optionalText(value: unknown): string | undefined {
  return value == null || value === '' ? undefined : text(value)
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    : []
}

export function normalizeItem(value: unknown): Item {
  const item = asRecord(value, 'item')
  return {
    id: normalizeId(item.id),
    name: text(item.name),
    price: number(item.price),
    stock: number(item.stock),
    image: text(item.image),
    category: text(item.category),
    brand: text(item.brand),
    spec: text(item.spec),
    sold: number(item.sold),
    commentCount: number(item.commentCount),
    isAD: Boolean(item.isAD),
    status: number(item.status),
  }
}

export function normalizePageResult<T>(value: unknown, normalize: (entry: unknown) => T): PageResult<T> {
  const page = asRecord(value, 'page')
  return {
    total: number(page.total),
    pages: number(page.pages),
    list: Array.isArray(page.list) ? page.list.map(normalize) : [],
  }
}

export function normalizeCartItem(value: unknown): CartItem {
  const item = asRecord(value, 'cart item')
  return {
    id: normalizeId(item.id),
    itemId: normalizeId(item.itemId, 'itemId'),
    num: number(item.num, 1),
    name: text(item.name),
    spec: text(item.spec),
    price: number(item.price),
    newPrice: item.newPrice == null ? null : number(item.newPrice),
    status: number(item.status),
    stock: number(item.stock),
    image: text(item.image),
    createTime: optionalText(item.createTime),
  }
}

export function normalizeAddress(value: unknown): Address {
  const address = asRecord(value, 'address')
  return {
    id: normalizeId(address.id),
    province: text(address.province),
    city: text(address.city),
    town: text(address.town),
    mobile: text(address.mobile),
    street: text(address.street),
    contact: text(address.contact),
    isDefault: address.isDefault === true || number(address.isDefault) === 1,
    notes: optionalText(address.notes),
  }
}

export function normalizeOrder(value: unknown): Order {
  const order = asRecord(value, 'order')
  return {
    id: normalizeId(order.id),
    totalFee: number(order.totalFee),
    paymentType: number(order.paymentType),
    userId: normalizeId(order.userId, 'userId'),
    status: number(order.status),
    createTime: optionalText(order.createTime),
    payTime: optionalText(order.payTime),
    consignTime: optionalText(order.consignTime),
    endTime: optionalText(order.endTime),
    closeTime: optionalText(order.closeTime),
    commentTime: optionalText(order.commentTime),
  }
}

export function normalizePayOrder(value: unknown): PayOrder {
  const payOrder = asRecord(value, 'pay order')
  return {
    id: normalizeId(payOrder.id),
    bizOrderNo: normalizeId(payOrder.bizOrderNo, 'bizOrderNo'),
    payOrderNo: normalizeId(payOrder.payOrderNo, 'payOrderNo'),
    bizUserId: normalizeId(payOrder.bizUserId, 'bizUserId'),
    payChannelCode: text(payOrder.payChannelCode),
    amount: number(payOrder.amount),
    payType: number(payOrder.payType),
    status: number(payOrder.status),
    expandJson: optionalText(payOrder.expandJson),
    resultCode: optionalText(payOrder.resultCode),
    resultMsg: optionalText(payOrder.resultMsg),
    paySuccessTime: optionalText(payOrder.paySuccessTime),
    payOverTime: optionalText(payOrder.payOverTime),
    createTime: optionalText(payOrder.createTime),
    updateTime: optionalText(payOrder.updateTime),
  }
}

export function normalizeSearchFilters(value: unknown): SearchFilters {
  const filters = asRecord(value, 'search filters')
  return {
    categories: stringList(filters.categories),
    brands: stringList(filters.brands),
  }
}

export function normalizeLoginResult(value: unknown): LoginResult {
  const result = asRecord(value, 'login result')
  if (typeof result.token !== 'string' || typeof result.username !== 'string') {
    throw new TypeError('login response is incomplete')
  }
  return {
    token: result.token,
    userId: normalizeId(result.userId, 'userId'),
    username: result.username,
    balance: number(result.balance),
  }
}
