import { defineStore } from 'pinia'

import { normalizeApiError } from '@/services/api'
import { getLatestItems, getSearchFilters, searchItems } from '@/services/catalog'
import type { Item, SearchFilters, SearchParams } from '@/types'

interface CatalogState {
  latest: Item[]
  items: Item[]
  total: number
  pages: number
  filters: SearchFilters
  query: Required<Pick<SearchParams, 'pageNo' | 'pageSize' | 'sortBy' | 'isAsc'>> & SearchParams
  loading: boolean
  filtersLoading: boolean
  error: string | null
}

export const useCatalogStore = defineStore('catalog', {
  state: (): CatalogState => ({
    latest: [],
    items: [],
    total: 0,
    pages: 0,
    filters: { categories: [], brands: [] },
    query: { pageNo: 1, pageSize: 20, sortBy: 'update_time', isAsc: false },
    loading: false,
    filtersLoading: false,
    error: null,
  }),
  actions: {
    setQuery(patch: Partial<SearchParams>): void {
      this.query = { ...this.query, ...patch }
    },
    async loadLatest(pageSize = 8): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.latest = (await getLatestItems(pageSize)).list
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.loading = false
      }
    },
    async search(patch: Partial<SearchParams> = {}): Promise<void> {
      this.setQuery(patch)
      this.loading = true
      this.error = null
      try {
        const result = await searchItems(this.query)
        this.items = result.list
        this.total = result.total
        this.pages = result.pages
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.loading = false
      }
    },
    async loadFilters(key?: string): Promise<void> {
      this.filtersLoading = true
      try {
        this.filters = await getSearchFilters(key ?? this.query.key ?? '')
      } catch (error) {
        const normalized = normalizeApiError(error)
        this.error = normalized.message
        throw normalized
      } finally {
        this.filtersLoading = false
      }
    },
  },
})
