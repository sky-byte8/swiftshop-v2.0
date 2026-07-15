import { SEARCH_SORT_FIELDS, type SearchSortField } from '@/types'

export function sanitizeSortBy(value: unknown): SearchSortField {
  return SEARCH_SORT_FIELDS.includes(value as SearchSortField)
    ? (value as SearchSortField)
    : 'update_time'
}
