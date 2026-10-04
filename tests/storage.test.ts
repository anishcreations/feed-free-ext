import { afterEach, expect, it, vi } from 'vitest'
import { CURRENT_VERSION, STORAGE_KEY, createDefaultState } from '../src/config/defaults'
import { loadState, saveState, onStateChanged } from '../src/utils/storage'
import { createChromeStorage } from './helpers/chrome'

afterEach(() => vi.unstubAllGlobals())

it('migrates old preferences, supplies missing fields, strips legacy fields, and writes only once', async () => {
  const api = createChromeStorage({ [STORAGE_KEY]: {
    version: '1.4.1', globalEnabled: false, lock: true,
    youtube: { nukeSidebar: true, nukeComments: true },
    instagram: { nukeExplore: true, hideCommentsCounts: true },
  } })
  vi.stubGlobal('chrome', api)
  const state = await loadState()
  expect(state.version).toBe(CURRENT_VERSION)
  expect(state.globalEnabled).toBe(false)
  expect(state).not.toHaveProperty('lock')
  expect(state.youtube).toMatchObject({ centerPlayer: true, keepPlaylist: false, nukeComments: true })
  expect(state.youtube).not.toHaveProperty('nukeSidebar')
  expect(state.instagram).toMatchObject({ hideComments: true, nukeExplore: true, allowExploreSearch: false, hideFloatingDMs: false })
  expect(state.instagram).not.toHaveProperty('hideCommentsCounts')
  expect(api.read(STORAGE_KEY)).toEqual(state)
  await loadState()
  expect(api.storage.local.set).toHaveBeenCalledTimes(1)
})

it('does not rewrite current settings or alias the stored object', async () => {
  const initial = createDefaultState()
  initial.instagram.allowExploreSearch = true
  initial.youtube.thumbnailBlurLevel = 18
  const api = createChromeStorage({ [STORAGE_KEY]: initial })
  vi.stubGlobal('chrome', api)
  const state = await loadState()
  state.youtube.thumbnailBlurLevel = 3
  expect(await loadState()).toEqual(initial)
  expect(api.storage.local.set).not.toHaveBeenCalled()
})

it('saves a complete state under the extension storage key and propagates write failure', async () => {
  const api = createChromeStorage()
  vi.stubGlobal('chrome', api)
  const state = createDefaultState()
  state.instagram.allowExploreSearch = true
  await saveState(state)
  expect(api.storage.local.set).toHaveBeenCalledWith({ [STORAGE_KEY]: state })
  state.instagram.allowExploreSearch = false
  expect(api.read(STORAGE_KEY)).toMatchObject({ instagram: { allowExploreSearch: true } })
  api.storage.local.set.mockRejectedValueOnce(new Error('QUOTA_BYTES exceeded'))
  await expect(saveState(state)).rejects.toThrow('QUOTA_BYTES')
  expect(api.read(STORAGE_KEY)).toMatchObject({ instagram: { allowExploreSearch: true } })
})

it('creates defaults on first load and merges a missing field even at the current version', async () => {
  const api = createChromeStorage()
  vi.stubGlobal('chrome', api)
  expect(await loadState()).toEqual(createDefaultState())
  const old = createDefaultState() as any
  delete old.instagram.allowExploreSearch
  old.instagram.nukeExplore = true
  await api.storage.local.set({ [STORAGE_KEY]: old })
  expect((await loadState()).instagram).toMatchObject({ nukeExplore: true, allowExploreSearch: false, hideFloatingDMs: false })
})

it('filters storage events, handles deletion, and unsubscribes', () => {
  const api = createChromeStorage()
  vi.stubGlobal('chrome', api)
  const callback = vi.fn()
  const stop = onStateChanged(callback)
  const state = createDefaultState()
  state.globalEnabled = false
  api.emit({ other: { newValue: state } })
  api.emit({ [STORAGE_KEY]: { newValue: state } }, 'sync')
  expect(callback).not.toHaveBeenCalled()
  api.emit({ [STORAGE_KEY]: { newValue: state } })
  expect(callback).toHaveBeenLastCalledWith(state)
  api.emit({ [STORAGE_KEY]: { oldValue: state } })
  expect(callback).toHaveBeenLastCalledWith(createDefaultState())
  stop()
  callback.mockClear()
  api.emit({ [STORAGE_KEY]: { newValue: state } })
  expect(callback).not.toHaveBeenCalled()
})
