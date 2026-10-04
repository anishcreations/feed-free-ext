import { describe, expect, it } from 'vitest'
import { createDefaultState } from '../src/config/defaults'
import { getActiveRules } from '../src/content/youtube/rules'

const names = (state: ReturnType<typeof createDefaultState>) => getActiveRules(state).map(r => r.name)

describe('YouTube feature combinations', () => {
  it('preserves existing defaults', () => {
    expect(names(createDefaultState())).toEqual([])
  })
  it('makes playlist visibility a child of Clean Player', () => {
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
  it('enables home-feed rules only while the feature and master switches are on', () => {
    const state = createDefaultState()
    state.youtube.nukeHomeFeed = true
    expect(names(state)).toContain('homeFeed')
    state.youtube.nukeHomeFeed = false
    expect(names(state)).not.toContain('homeFeed')
    state.youtube.nukeHomeFeed = true
    state.globalEnabled = false
    expect(names(state)).not.toContain('homeFeed')
  })
})
