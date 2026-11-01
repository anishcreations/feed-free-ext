// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDefaultState } from '../src/config/defaults'
import { handleYouTubeRedirect, updateYouTubeLogoLink } from '../src/content/youtube/redirect'

describe('YouTube Redirect', () => {
  const originalLocation = window.location

  beforeEach(() => {
    delete (window as any).location
    window.location = {
      ...originalLocation,
      pathname: '/',
      href: 'https://www.youtube.com/',
      replace: vi.fn(),
      assign: vi.fn(),
    } as any
    document.body.innerHTML = ''
  })

  afterEach(() => {
    window.location = originalLocation
    vi.restoreAllMocks()
  })

  it('redirects home to /feed/subscriptions when redirectHomeToSubscriptions is enabled', () => {
    const state = createDefaultState()
    state.youtube.redirectHomeToSubscriptions = true

    const didRedirect = handleYouTubeRedirect(state)
    expect(didRedirect).toBe(true)
    expect(window.location.replace).toHaveBeenCalledWith('/feed/subscriptions')
  })

  it('does not redirect when redirectHomeToSubscriptions is disabled', () => {
    const state = createDefaultState()
    state.youtube.redirectHomeToSubscriptions = false

    const didRedirect = handleYouTubeRedirect(state)
    expect(didRedirect).toBe(false)
    expect(window.location.replace).not.toHaveBeenCalled()
  })

  it('does not redirect when master switch is disabled', () => {
    const state = createDefaultState()
    state.youtube.redirectHomeToSubscriptions = true
    state.globalEnabled = false

    const didRedirect = handleYouTubeRedirect(state)
    expect(didRedirect).toBe(false)
    expect(window.location.replace).not.toHaveBeenCalled()
  })

  it('does not redirect when on a non-home path', () => {
    const state = createDefaultState()
    state.youtube.redirectHomeToSubscriptions = true
    window.location.pathname = '/watch'

    const didRedirect = handleYouTubeRedirect(state)
    expect(didRedirect).toBe(false)
    expect(window.location.replace).not.toHaveBeenCalled()
  })

  it('updates the logo link href to /feed/subscriptions when redirect is active', () => {
    const state = createDefaultState()
    document.body.innerHTML = '<a id="logo" href="/">YouTube</a>'

    state.youtube.redirectHomeToSubscriptions = true
    updateYouTubeLogoLink(state)
    expect((document.getElementById('logo') as HTMLAnchorElement).getAttribute('href')).toBe('/feed/subscriptions')

    state.youtube.redirectHomeToSubscriptions = false
    updateYouTubeLogoLink(state)
    expect((document.getElementById('logo') as HTMLAnchorElement).getAttribute('href')).toBe('/')
  })
})
