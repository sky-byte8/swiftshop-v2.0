import type { Item, PageResult, SearchFilters, SearchParams } from '@/types'
import { normalizeId } from '@/utils/id'
import { sanitizeSortBy } from '@/utils/search'
import { apiRequest } from './api'
import { normalizeItem, normalizePageResult, normalizeSearchFilters } from './normalizers'

function cleanSearchParams(params: SearchParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    pageNo: Math.max(1, params.pageNo ?? 1),
    pageSize: Math.max(1, params.pageSize ?? 20),
    sortBy: sanitizeSortBy(params.sortBy),
    isAsc: params.isAsc ?? false,
  }

  if (params.key?.trim()) query.key = params.key.trim()
  if (params.category?.trim()) query.category = params.category.trim()
  if (params.brand?.trim()) query.brand = params.brand.trim()
  if (params.minPrice != null) query.minPrice = Math.max(0, params.minPrice)
  if (params.maxPrice != null) query.maxPrice = Math.max(0, params.maxPrice)
  return query
}

export async function searchItems(params: SearchParams = {}): Promise<PageResult<Item>> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    url: '/search/list',
    params: cleanSearchParams(params),
  })
  return normalizePageResult(response, normalizeItem)
}

export async function getLatestItems(pageSize = 8): Promise<PageResult<Item>> {
  return searchItems({ pageNo: 1, pageSize, sortBy: 'update_time', isAsc: false })
}

export async function getItem(id: string): Promise<Item> {
  const response = await apiRequest<unknown>({ method: 'GET', url: `/items/${normalizeId(id)}` })
  return normalizeItem(response)
}

export async function getSearchFilters(key = ''): Promise<SearchFilters> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    url: '/search/filters',
    params: key.trim() ? { key: key.trim() } : undefined,
  })
  return normalizeSearchFilters(response)
}
