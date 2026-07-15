import { readonly, ref } from 'vue'

export type NoticeTone = 'success' | 'error' | 'info'

export interface Notice {
  id: number
  message: string
  tone: NoticeTone
}

const notices = ref<Notice[]>([])
let nextId = 1

function dismiss(id: number) {
  notices.value = notices.value.filter((notice) => notice.id !== id)
}

function push(message: string, tone: NoticeTone = 'info', duration = 3200) {
  const id = nextId++
  notices.value.push({ id, message, tone })
  window.setTimeout(() => dismiss(id), duration)
  return id
}

export function useNotice() {
  return {
    notices: readonly(notices),
    push,
    dismiss,
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error', 4800),
  }
}
