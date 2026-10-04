import { vi } from 'vitest'

// An in-memory adapter for the Chrome API boundary, not an extension-runtime test.
// Clone at both boundaries so shared object references cannot fake persistence.
export function createChromeStorage(initial: Record<string, unknown> = {}) {
  let data = structuredClone(initial)
  const listeners = new Set<(changes: Record<string, chrome.storage.StorageChange>, area: string) => void>()
  const emit = (changes: Record<string, chrome.storage.StorageChange>, area = 'local') => {
    for (const listener of listeners) listener(structuredClone(changes), area)
  }
  const local = {
    get: vi.fn(async (key: string) => ({ [key]: structuredClone(data[key]) })),
    set: vi.fn(async (values: Record<string, unknown>) => {
      const changes: Record<string, chrome.storage.StorageChange> = {}
      for (const [key, value] of Object.entries(values)) {
        changes[key] = { oldValue: data[key], newValue: structuredClone(value) }
        data[key] = structuredClone(value)
      }
      emit(changes)
    }),
    clear: vi.fn(async () => {
      const changes = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, { oldValue: value }]))
      data = {}
      emit(changes)
    }),
  }
  return {
    storage: { local, onChanged: {
      addListener: vi.fn(listener => listeners.add(listener)),
      removeListener: vi.fn(listener => listeners.delete(listener)),
    } },
    tabs: { query: vi.fn(async () => [{ id: 7 }]), sendMessage: vi.fn(async () => {}) },
    emit,
    read: (key: string) => structuredClone(data[key]),
    listeners,
  }
}
