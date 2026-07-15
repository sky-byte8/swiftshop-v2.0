export type ProductSpec = Record<string, string>

export function parseSpec(value: string | null | undefined): ProductSpec {
  if (!value?.trim()) {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(value)

    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, entry]) => ['string', 'number', 'boolean'].includes(typeof entry))
        .map(([key, entry]) => [key, String(entry)]),
    )
  } catch {
    return {}
  }
}
