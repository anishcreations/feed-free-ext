import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDefaultState } from '../src/config/defaults'
import { getActiveRules } from '../src/content/instagram/rules'
import { shouldRedirectExplore } from '../src/content/instagram/explore'

afterEach(() => vi.unstubAllGlobals())
const names = (state: ReturnType<typeof createDefaultState>) => getActiveRules(state).map(rule => rule.name)

describe('Instagram Explore modes', () => {
  it('selects navigation hiding by default and classifies blocked Explore URLs', () => {
    const state = createDefaultState()
    state.instagram.nukeExplore = true
    expect(state.instagram.allowExploreSearch).toBe(false)
    vi.stubGlobal('window', { location: { pathname: '/' } })
    expect(names(state)).toContain('explore')
    for (const pathname of ['/explore', '/explore/', '/explore/search/', '/explore/tags/art/']) {
      expect(shouldRedirectExplore(state, pathname)).toBe(true)
    }
    for (const pathname of ['/', '/someone/', '/p/123/', '/explorer/']) {
      expect(shouldRedirectExplore(state, pathname)).toBe(false)
    }
  })

  it('selects feed rules on landing routes while allowing search', () => {
    const state = createDefaultState()
    Object.assign(state.instagram, { nukeExplore: true, allowExploreSearch: true })
    for (const pathname of ['/explore', '/explore/']) {
      vi.stubGlobal('window', { location: { pathname } })
      expect(names(state)).not.toContain('explore')
      const feed = getActiveRules(state).find(rule => rule.name === 'exploreFeed')
      expect(feed).toBeDefined()
      expect(shouldRedirectExplore(state, pathname)).toBe(false)
    }
  })

  it('selects no feed rules for search results and non-landing paths', () => {
    const location = { pathname: '/explore/' }
    vi.stubGlobal('window', { location })
    const state = createDefaultState()
    Object.assign(state.instagram, { nukeExplore: true, allowExploreSearch: true })
    for (const pathname of ['/explore/search/', '/explore/tags/art/', '/explore/locations/123/', '/someone/', '/p/123/', '/']) {
      location.pathname = pathname
      expect(names(state)).not.toContain('exploreFeed')
      expect(shouldRedirectExplore(state, pathname)).toBe(false)
    }
    location.pathname = '/explore/'
    expect(names(state)).toContain('exploreFeed')
  })

  it('keeps the child preference but disables all Explore effects with either parent switch', () => {
    vi.stubGlobal('window', { location: { pathname: '/explore/' } })
    const state = createDefaultState()
    Object.assign(state.instagram, { nukeExplore: true, allowExploreSearch: true })
    state.instagram.nukeExplore = false
    expect(names(state)).not.toContain('exploreFeed')
    expect(names(state)).not.toContain('explore')
    expect(shouldRedirectExplore(state, '/explore/')).toBe(false)
    state.instagram.nukeExplore = true
    expect(names(state)).toContain('exploreFeed')
    state.globalEnabled = false
    for (const allowExploreSearch of [true, false]) {
      state.instagram.allowExploreSearch = allowExploreSearch
      expect(names(state)).not.toContain('exploreFeed')
      expect(names(state)).not.toContain('explore')
      expect(shouldRedirectExplore(state, '/explore/')).toBe(false)
    }
  })
})
