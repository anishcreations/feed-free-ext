import type { FeedFreeState } from '../../types'

const MARKER = 'data-ff-floating-dm'
const ICON = 'svg:is([aria-label="Messages"], [aria-label="Direct"], [aria-label="Messenger"]), svg path[d^="M13.973"]'
const CANDIDATES = `a[href^="/direct"], :is(button, [role="button"]):has(${ICON})`
let observer: MutationObserver | null = null
let frame: number | null = null

function clearMarkers(): void {
  document.querySelectorAll(`[${MARKER}]`).forEach(el => el.removeAttribute(MARKER))
}

function scan(): void {
  // Measure the original layout even when an earlier scan hid the launcher.
  // Removal and reapplication happen synchronously before the browser paints.
  clearMarkers()
  const targets = new Set<HTMLElement>()
  for (const candidate of document.querySelectorAll<HTMLElement>(CANDIDATES)) {
    if (candidate.closest('nav, header, [role="navigation"], [role="dialog"]')) continue
    for (let ancestor: HTMLElement | null = candidate; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor)
      if (style.position !== 'fixed') continue
      // A fixed sidebar or a full-screen app shell is not a floating launcher.
      const box = ancestor.getBoundingClientRect()
      if (style.bottom !== 'auto' && style.right !== 'auto' &&
          box.width > 0 && box.height > 0 && box.left >= innerWidth / 2 && box.top >= innerHeight / 2 &&
          box.width < innerWidth * 0.6 && box.height < innerHeight * 0.4) {
        targets.add(ancestor)
      }
      break
    }
  }
  targets.forEach(el => el.setAttribute(MARKER, ''))
}

function scheduleScan(): void {
  if (frame !== null) return
  frame = requestAnimationFrame(() => { frame = null; scan() })
}

export function syncFloatingDMs(state: FeedFreeState): void {
  const enabled = state.globalEnabled && (state.instagram.blockDMs || state.instagram.hideFloatingDMs)
  if (!enabled) {
    observer?.disconnect()
    observer = null
    window.removeEventListener('resize', scheduleScan)
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    clearMarkers()
    return
  }
  scan()
  if (observer) return
  observer = new MutationObserver(scheduleScan)
  observer.observe(document.documentElement, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['class', 'style', 'href', 'aria-label'],
  })
  window.addEventListener('resize', scheduleScan)
}
