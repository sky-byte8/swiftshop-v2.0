export type Identifier = string
export type Money = number

export interface Item {
  id: Identifier
  name: string
  price: Money
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

export interface PageResult<T> {
  total: number
  pages: number
  list: T[]
}

export interface CartItem {
  id: Identifier
  itemId: Identifier
  num: number
  name: string
  spec: string
  price: Money
  newPrice: Money | null
  status: number
  stock: number
  image: string
  createTime?: string
}

export interface Address {
  id: Identifier
  province: string
  city: string
  town: string
  mobile: string
  street: string
  contact: string
  isDefault: boolean
  notes?: string
}

export interface Order {
  id: Identifier
  totalFee: Money
  paymentType: number
  userId: Identifier
  status: number
  createTime?: string
  payTime?: string
  consignTime?: string
  endTime?: string
  closeTime?: string
  commentTime?: string
}

export interface PayOrder {
  id: Identifier
  bizOrderNo: Identifier
  payOrderNo: Identifier
  bizUserId: Identifier
  payChannelCode: string
  amount: Money
  payType: number
  status: number
  expandJson?: string
  resultCode?: string
  resultMsg?: string
  paySuccessTime?: string
  payOverTime?: string
  createTime?: string
  updateTime?: string
}

export interface SearchFilters {
  categories: string[]
  brands: string[]
}

export const SEARCH_SORT_FIELDS = ['update_time', 'price', 'sold'] as const
export type SearchSortField = (typeof SEARCH_SORT_FIELDS)[number]

export interface SearchParams {
  key?: string
  category?: string
  brand?: string
  minPrice?: Money
  maxPrice?: Money
  pageNo?: number
  pageSize?: number
  sortBy?: SearchSortField
  isAsc?: boolean
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface UserSession {
  userId: Identifier
  username: string
  balance: Money
}

export interface LoginResult extends UserSession {
  token: string
}

export interface AddCartItemInput {
  itemId: Identifier
  num: number
  name: string
  spec: string
  price: Money
  image: string
}

export interface OrderDetailInput {
  itemId: Identifier
  num: number
}

export interface CreateOrderInput {
  addressId: Identifier
  paymentType: 3
  details: OrderDetailInput[]
}

export interface CreatePayOrderInput {
  bizOrderNo: Identifier
  amount: Money
  payChannelCode: 'balance'
  payType: 5
  orderInfo: string
}

export interface ApiErrorOptions {
  status?: number
  code?: number | string
  details?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly status?: number
  readonly code?: number | string
  readonly details?: unknown

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
  }
}
