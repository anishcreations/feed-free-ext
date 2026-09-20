import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDefaultState } from '../src/config/defaults'
import { getActiveRules } from '../src/content/youtube/rules'

afterEach(() => vi.unstubAllGlobals())
const names = (state: ReturnType<typeof createDefaultState>) => getActiveRules(state).map(r => r.name)

describe('YouTube feature combinations', () => {
  it('preserves existing defaults', () => {
    vi.stubGlobal('window', { location: { pathname: '/watch' } })
    expect(names(createDefaultState())).toEqual([])
  })
  it('makes playlist visibility a child of Clean Player', () => {
    vi.stubGlobal('window', { location: { pathname: '/watch' } })
    const state = createDefaultState()
    Object.assign(state.youtube, { centerPlayer: true, blurThumbnails: true })
    expect(names(state)).toEqual(['centerPlayer', 'blurThumbnails'])
    state.youtube.keepPlaylist = false
    expect(names(state)).toEqual(['hideWatchPlaylist', 'centerPlayer', 'blurThumbnails'])
    state.youtube.centerPlayer = false
    expect(names(state)).toEqual(['blurThumbnails'])
  })
  it('disables new features with the master switch while preserving audio and grayscale', () => {
    const state = createDefaultState()
    state.globalEnabled = false
    Object.assign(state.youtube, { centerPlayer: true, blurThumbnails: true, musicOnlyMode: true, grayMode: true })
    expect(names(state)).toEqual(['musicOnly', 'grayMode'])
  })
  it('keeps home-only hiding active while the URL changes ahead of the DOM', () => {
    const location = { pathname: '/' }
    vi.stubGlobal('window', { location })
    const state = createDefaultState()
    state.youtube.nukeHomeFeed = true
    const homeRules = getActiveRules(state)
    for (const pathname of ['/playlist', '/results', '/watch', '/@channel']) {
      location.pathname = pathname
      expect(getActiveRules(state)).toEqual(homeRules)
    }
    for (const rule of homeRules.flatMap(r => r.selectors)) {
      for (const selector of [rule.selector, ...rule.fallbacks]) {
        expect(selector).toContain('ytd-browse[page-subtype="home"]')
      }
    }
    state.youtube.nukeHomeFeed = false
    expect(names(state)).not.toContain('homeFeed')
    state.youtube.nukeHomeFeed = true
    state.globalEnabled = false
    expect(names(state)).not.toContain('homeFeed')
  })
})
