import type { FeedFreeState } from '../../types'

export function isExploreLanding(pathname: string): boolean {
  return /^\/explore\/?$/.test(pathname)
}

export function shouldRedirectExplore(state: FeedFreeState, pathname: string): boolean {
  return state.globalEnabled && state.instagram.nukeExplore &&
    !state.instagram.allowExploreSearch && /^\/explore(?:\/|$)/.test(pathname)
}
