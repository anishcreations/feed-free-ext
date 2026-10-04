import { afterEach, expect, it, vi } from 'vitest'
import { CURRENT_VERSION, STORAGE_KEY, createDefaultState } from '../src/config/defaults'
import { loadState, saveState } from '../src/utils/storage'
import { getActiveRules } from '../src/content/youtube/rules'

afterEach(() => vi.unstubAllGlobals())

it('upgrades old settings without losing preferences and writes only once', async () => {
  let saved: any = { version: '1.4.1', globalEnabled: false, youtube: { nukeComments: true, musicOnlyMode: true }, instagram: { hideComments: true } }
  const set = vi.fn(async (value) => { saved = value[STORAGE_KEY] })
  vi.stubGlobal('chrome', { storage: { local: { get: vi.fn(async () => ({ [STORAGE_KEY]: saved })), set } } })
  const state = await loadState()
  expect(state.version).toBe(CURRENT_VERSION)
  expect(state.globalEnabled).toBe(false)
  expect(state.youtube).toMatchObject({ nukeComments: true, musicOnlyMode: true, centerPlayer: false, blurThumbnails: false })
  expect(state.instagram.hideComments).toBe(true)
  expect(await loadState()).toEqual(state)
  expect(set).toHaveBeenCalledTimes(1)
})

it('does not write on a normal settings read', async () => {
  const set = vi.fn()
  vi.stubGlobal('chrome', { storage: { local: { get: vi.fn(async () => ({ [STORAGE_KEY]: createDefaultState() })), set } } })
  await loadState()
  await loadState()
  expect(set).not.toHaveBeenCalled()
})

it.each(['1.4.1', CURRENT_VERSION])('migrates the legacy sidebar switch from %s', async (version) => {
  const saved = { ...createDefaultState(), version, youtube: { nukeSidebar: true, nukeComments: true } }
  const set = vi.fn()
  vi.stubGlobal('chrome', { storage: { local: { get: vi.fn(async () => ({ [STORAGE_KEY]: saved })), set } } })
  const state = await loadState()
  expect(state.youtube).toMatchObject({ centerPlayer: true, keepPlaylist: false, nukeComments: true })
  expect(state.youtube).not.toHaveProperty('nukeSidebar')
})

it('remembers blur strength while disabled and applies it after re-enabling', async () => {
  let saved = createDefaultState()
  vi.stubGlobal('chrome', { storage: { local: {
    get: vi.fn(async () => ({ [STORAGE_KEY]: saved })),
    set: vi.fn(async (value) => { saved = value[STORAGE_KEY] }),
  } } })
  saved.youtube.thumbnailBlurLevel = 18
  await saveState(saved)
  const state = await loadState()
  expect(state.youtube.thumbnailBlurLevel).toBe(18)
  expect(getActiveRules(state).some(rule => rule.name === 'blurThumbnails')).toBe(false)
  state.youtube.blurThumbnails = true
  expect(getActiveRules(state).find(rule => rule.name === 'blurThumbnails')?.selectors[0].value).toBe('blur(18px)')
})

it('adds opt-in Explore search to older settings and persists the enabled preference', async () => {
  let saved: any = { version: '1.6.1', globalEnabled: true, instagram: { nukeExplore: true } }
  vi.stubGlobal('chrome', { storage: { local: {
    get: vi.fn(async () => ({ [STORAGE_KEY]: saved })),
    set: vi.fn(async (value) => { saved = value[STORAGE_KEY] }),
  } } })
  const state = await loadState()
  expect(state.instagram).toMatchObject({ nukeExplore: true, allowExploreSearch: false })
  state.instagram.allowExploreSearch = true
  await saveState(state)
  expect((await loadState()).instagram.allowExploreSearch).toBe(true)
})
