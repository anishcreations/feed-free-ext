import { getActiveRules } from '../content/youtube/rules'
import { getActiveRules as getInstagramRules } from '../content/instagram/rules'
import { loadState } from '../utils/storage'
import type { FeedFreeState } from '../types'

const AF_STYLE_ID = 'ff-antiflicker'

function injectCSS(css: string): void {
  const existing = document.getElementById(AF_STYLE_ID)
  if (existing) existing.remove()

  const style = document.createElement('style')
  style.id = AF_STYLE_ID
  style.textContent = css
  document.documentElement.appendChild(style)
}

function buildAntiflickerCSS(state: FeedFreeState, platform: 'youtube' | 'instagram'): string {
  // Reuse route-scoped runtime rules from first paint, including Instagram search.
  const rules = platform === 'youtube' ? getActiveRules(state) : getInstagramRules(state)
  return rules.flatMap(({ selectors }) => selectors.flatMap(rule =>
    [rule.selector, ...rule.fallbacks].map(sel =>
      `${sel} { ${rule.property}: ${rule.value} !important; }`
    )
  )).join('\n')
}

async function init(): Promise<void> {
  const hostname = window.location.hostname
  let platform: 'youtube' | 'instagram' | null = null

  if (hostname.includes('youtube.com')) platform = 'youtube'
  else if (hostname.includes('instagram.com')) platform = 'instagram'
  else return

  try {
    const state = await loadState()
    if (!state.globalEnabled) return

    const css = buildAntiflickerCSS(state, platform)
    if (css) injectCSS(css)
  } catch {
    /* fail silently — main content script takes over */
  }
}

init()
