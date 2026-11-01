import type { FeedFreeState } from '../../types'

const log = console.log.bind(console, '[FeedFree:YouTube]')
const err = console.error.bind(console, '[FeedFree:YouTube]')

export function handleYouTubeRedirect(state: FeedFreeState): boolean {
  try {
    if (!state.globalEnabled || !state.youtube.redirectHomeToSubscriptions) return false

    const path = location.pathname
    const isHome = path === '/' || path === ''
    if (!isHome) return false

    log('redirectHomeToSubscriptions — redirecting to /feed/subscriptions')
    location.replace('/feed/subscriptions')
    return true
  } catch (e) {
    err('handleYouTubeRedirect failed:', e)
    return false
  }
}

let logoListenerAttached = false

export function updateYouTubeLogoLink(state: FeedFreeState): void {
  try {
    const isRedirect = state.globalEnabled && state.youtube.redirectHomeToSubscriptions
    const logos = document.querySelectorAll<HTMLAnchorElement>('a#logo, ytd-topbar-logo-renderer a, ytd-logo a')
    logos.forEach((logo) => {
      logo.href = isRedirect ? '/feed/subscriptions' : '/'
    })
  } catch (e) {
    err('updateYouTubeLogoLink failed:', e)
  }
}

export function setupYouTubeLogoInterceptor(getState: () => FeedFreeState | null): void {
  if (logoListenerAttached) return
  logoListenerAttached = true

  document.addEventListener('click', (event) => {
    const state = getState()
    if (!state || !state.globalEnabled || !state.youtube.redirectHomeToSubscriptions) return

    const target = event.target as HTMLElement | null
    if (!target) return

    const logoAnchor = target.closest<HTMLAnchorElement>('a#logo, ytd-topbar-logo-renderer a, ytd-logo a, a[href="/"]')
    if (!logoAnchor) return

    const href = logoAnchor.getAttribute('href')
    // Only intercept if this is the logo or leading to YouTube root home
    if (href === '/' || href === '' || logoAnchor.id === 'logo' || logoAnchor.closest('ytd-topbar-logo-renderer')) {
      // If user clicked with modifier keys (ctrl, cmd, shift), the updated href='/feed/subscriptions' handles it naturally.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      // Prefer native SPA navigation if a subscriptions link is available in the DOM
      const subsLink = document.querySelector<HTMLAnchorElement>('ytd-guide-entry-renderer a[href="/feed/subscriptions"], ytd-mini-guide-entry-renderer a[href="/feed/subscriptions"], a[href="/feed/subscriptions"]')
      if (subsLink) {
        subsLink.click()
      } else {
        location.assign('/feed/subscriptions')
      }
    }
  }, true)
}
