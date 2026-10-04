import { afterEach, expect, it, vi } from 'vitest'
import { siteFromUrl } from '../src/popup/site'
import { useStore } from '../src/popup/store'
import { createDefaultState, STORAGE_KEY } from '../src/config/defaults'

afterEach(() => {
  vi.unstubAllGlobals()
  useStore.setState({ state: createDefaultState(), loaded: false })
})

it.each([
  ['https://www.youtube.com/watch?v=1', 'youtube'],
  ['https://youtube.com/', 'youtube'],
  ['https://www.instagram.com/direct/', 'instagram'],
  ['https://instagram.com/', 'instagram'],
  ['https://example.com/?next=https://youtube.com', 'other'],
  ['https://youtube.com.example.com/', 'other'],
  ['https://notinstagram.com/', 'other'],
  ['https://instagram.com@example.com/', 'other'],
  ['file://youtube.com/video', 'other'],
  ['', 'other'],
])('detects the platform for %s', (url, expected) => {
  expect(siteFromUrl(url)).toBe(expected)
})

it('cleans up initialization listeners and ignores an earlier mount resolving late', async () => {
  const resolvers: Array<(value: unknown) => void> = []
  const listeners = new Set<(...args: any[]) => void>()
  vi.stubGlobal('chrome', { storage: {
    local: {
      get: vi.fn(() => new Promise(resolve => resolvers.push(resolve))),
      set: vi.fn(async () => {}),
    },
    onChanged: {
      addListener: vi.fn(listener => listeners.add(listener)),
      removeListener: vi.fn(listener => listeners.delete(listener)),
    },
  } })
  const stopFirst = useStore.getState().init()
  expect(listeners.size).toBe(1)
  stopFirst()
  expect(listeners.size).toBe(0)
  const stopSecond = useStore.getState().init()
  const current = createDefaultState()
  current.globalEnabled = false
  resolvers[1]({ [STORAGE_KEY]: current })
  await vi.waitFor(() => expect(useStore.getState().loaded).toBe(true))
  resolvers[0]({ [STORAGE_KEY]: createDefaultState() })
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(useStore.getState().state.globalEnabled).toBe(false)
  const updated = { ...current, globalEnabled: true }
  for (const listener of listeners) listener({ [STORAGE_KEY]: { newValue: updated } }, 'local')
  expect(useStore.getState().state.globalEnabled).toBe(true)
  stopSecond()
  expect(listeners.size).toBe(0)
})
