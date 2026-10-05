import { shouldRedirectExplore } from './explore'
import { isDashboardPath } from './nav-items'
import type { FeedFreeState } from '../../types'

const log = console.log.bind(console, '[FeedFree:Instagram]')
const err = console.error.bind(console, '[FeedFree:Instagram]')

const SYSTEM_PATHS = [
  'direct', 'explore', 'reels', 'saved', 'about', 'developer',
  'terms', 'privacy', 'legal', 'accounts', 'emailsignup',
  'logging', 'ajax', 'api', 'create', 'notifications',
  'messages', 'play', 'press', 'safety', 'directory',
  'stories', 'p', 'tv', 'blog', 'jobs', 'help', 'settings',
  'meta'
]

export function isProfilePath(path: string): boolean {
  const clean = path.replace(/^\/|\/$/g, '').split('?')[0]
  if (!clean || clean.includes('/')) return false
  return !SYSTEM_PATHS.includes(clean)
}

const NAVIGATION = 'nav, [role="navigation"], header'

function navigationPath(link: HTMLAnchorElement): string | null {
  try {
    const url = new URL(link.getAttribute('href') || '', location.href)
    if (url.origin !== new URL(location.href).origin) return null
    return url.pathname
  } catch {
    return null
  }
}

function isLoggedIn(): boolean {
  if (/^\/accounts\/(?:login|emailsignup|onetap)(?:\/|$)/.test(location.pathname)) return false
  if (/(?:^|;\s*)ds_user_id=[^;]+/.test(document.cookie)) return true

  // CSS can hide navigation without removing it. Use its structure and routes,
  // not translated accessible labels or links in posts and public page content.
  for (const container of document.querySelectorAll(NAVIGATION)) {
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href]'))
    const paths = links.map(navigationPath).filter((path): path is string => path !== null)
    if (paths.some(path => /^\/accounts\/(?:login|emailsignup)(?:\/|$)/.test(path))) continue
    if (paths.some(path => /^\/(?:direct|explore|reels|saved)(?:\/|$)/.test(path))) return true

    // Some layouts expose actions as buttons rather than route links. An own
    // profile link beside home/icon controls is a fallback for those layouts.
    const hasProfile = paths.some(isProfilePath)
    if (hasProfile && (paths.includes('/') || container.querySelector('svg'))) return true
  }
  return false
}

function getProfileUrl(): string | null {
  try {
    const navContainers = document.querySelectorAll(NAVIGATION)
    for (const container of navContainers) {
      const links = container.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')
      for (const link of links) {
        const href = link.getAttribute('href')
        if (href && isProfilePath(href)) return href
      }
    }
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')
    for (const link of links) {
      if (link.closest('article')) continue
      const href = link.getAttribute('href')
      if (href && isProfilePath(href)) return href
    }
  } catch (e) {
    err('getProfileUrl failed:', e)
  }
  return null
}

function getUsernameFromProfileUrl(url: string | null): string | null {
  if (!url) return null
  const clean = url.replace(/^\/|\/$/g, '').split('?')[0]
  return clean || null
}

export function handleRedirect(state: FeedFreeState): boolean {
  try {
    if (!state.globalEnabled) return false
    if (!isLoggedIn()) return false

    const path = location.pathname

    if (state.instagram.blockDMs && path.startsWith('/direct')) {
      if (state.instagram.nukeMainFeed && state.instagram.conflictRedirectTarget === 'saved') {
        const username = getUsernameFromProfileUrl(getProfileUrl())
        if (username) { log('blockDMs + nukeMainFeed — redirecting to saved'); location.replace(`/${username}/saved/`) }
        else { log('blockDMs + nukeMainFeed — username not found, redirecting to /'); location.replace('/') }
      } else {
        const username = getUsernameFromProfileUrl(getProfileUrl())
        location.replace(username ? `/${username}/` : '/')
      }
      return true
    }

    if (state.instagram.nukeNotifications && (
      path.startsWith('/notifications') || path.startsWith('/accounts/activity') || path.startsWith('/activity')
    )) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
      return true
    }

    if (state.instagram.nukeDashboard && isDashboardPath(path)) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
      return true
    }

    if (state.instagram.nukeReels && path.startsWith('/reels')) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
      return true
    }

    if (shouldRedirectExplore(state, path)) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
      return true
    }

    if (state.instagram.nukeStoriesEverywhere && path.startsWith('/stories')) {
      const username = getUsernameFromProfileUrl(getProfileUrl())
      location.replace(username ? `/${username}/` : '/')
      return true
    }

    const isMainFeed = path === '/' || path === ''
    if (!isMainFeed) return false

    if (state.instagram.nukeMainFeed || state.instagram.forceChronological) {
      let target: 'following' | 'dms' | 'profile' | 'saved' =
        state.instagram.forceChronological && !state.instagram.nukeMainFeed
          ? 'following'
          : state.instagram.homeRedirectTarget || 'dms'

      if (state.instagram.blockDMs && target === 'dms') {
        target = state.instagram.conflictRedirectTarget || 'profile'
      }

      if (target === 'following') {
        const url = new URL(location.href)
        if (!url.searchParams.has('variant')) {
          url.searchParams.set('variant', 'following')
          log('nukeMainFeed — redirecting to following')
          location.replace(url.toString())
          return true
        }
        return false
      }

      if (target === 'saved') {
        const username = getUsernameFromProfileUrl(getProfileUrl())
        if (username) { log('nukeMainFeed — redirecting to saved'); location.replace(`/${username}/saved/`); return true }
        return false
      }

      if (target === 'profile') {
        const username = getUsernameFromProfileUrl(getProfileUrl())
        if (username) { log('nukeMainFeed — redirecting to profile'); location.replace(`/${username}/`); return true }
        return false
      }

      log('nukeMainFeed — redirecting to DMs')
      location.replace('/direct/inbox/')
      return true
    }
  } catch (e) {
    err('handleRedirect failed:', e)
  }
  return false
}
