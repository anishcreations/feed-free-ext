import type { CleanPlayerSize, SelectorRule } from '../../types'

// CSS-only layout: YouTube retains ownership of the player and playlist DOM.
// Explicit theater/fullscreen/miniplayer modes retain their native dimensions.
const watch = 'ytd-watch-flexy:not([theater]):not([fullscreen]):not([is-mini-player]):not([hidden]):not(:has(:fullscreen))'
const columns = `${watch} > #columns`
const narrowPlayer = `${watch}[full-bleed-player] > #full-bleed-container`
const ratio = 'var(--ytd-watch-flexy-width-ratio, 16) / var(--ytd-watch-flexy-height-ratio, 9)'

const rule = (selector: string, property: string, value: string): SelectorRule => ({
  selector, property, value, fallbacks: [],
})

export function getCenterPlayerRules(
  size: CleanPlayerSize = 'default',
  customWidth = 1600,
): SelectorRule[] {
  let maxWidth: string
  let width = 'calc(100% - clamp(32px, 6vw, 96px))'

  switch (size) {
    case 'wide':
      maxWidth = `min(1440px, max(160px, calc((100vh - 140px) * ${ratio})))`
      width = 'calc(100% - clamp(24px, 5vw, 64px))'
      break
    case 'full':
      maxWidth = `calc(100% - clamp(24px, 4vw, 48px))`
      width = 'calc(100% - clamp(24px, 4vw, 48px))'
      break
    case 'custom': {
      const clamped = Math.min(3840, Math.max(600, customWidth || 1600))
      maxWidth = `min(${clamped}px, max(160px, calc((100vh - 120px) * ${ratio})))`
      width = 'calc(100% - clamp(24px, 5vw, 64px))'
      break
    }
    case 'default':
    default:
      maxWidth = `min(1120px, max(160px, calc((100vh - 200px) * ${ratio})))`
      width = 'calc(100% - clamp(32px, 6vw, 96px))'
      break
  }

  return [
    rule(`${columns}, ${narrowPlayer}`, 'width', width),
    rule(`${columns}, ${narrowPlayer}`, 'max-width', maxWidth),
    rule(`${columns}, ${narrowPlayer}`, 'min-width', '0'),
    rule(`${columns}, ${narrowPlayer}`, 'margin-inline', 'auto'),
    rule(`${columns}, ${narrowPlayer}`, 'padding-inline', '0'),
    rule(columns, 'display', 'grid'),
    rule(columns, 'grid-template-columns', 'minmax(0, 1fr)'),
    rule(columns, 'padding-top', '24px'),
    rule(`${columns} > #primary, ${columns} > #primary > #primary-inner`, 'display', 'contents'),
    rule(`${columns} #player`, 'grid-row', '1'),
    rule(`${columns} > #secondary`, 'grid-row', '2'),
    rule(`${columns} #below`, 'grid-row', '3'),
    rule(`${columns} #player, ${columns} > #secondary, ${columns} #below`, 'grid-column', '1'),
    rule(`${columns} #player, ${columns} > #secondary, ${columns} #below`, 'min-width', '0'),
    rule(`${columns} #player, ${columns} > #secondary, ${columns} #below`, 'width', '100%'),
    rule(`${columns} > #secondary`, 'max-width', 'none'),
    rule(`${columns} > #secondary`, 'padding', '0'),
    rule(`${columns} > #secondary`, 'margin', '0'),
    rule(`${columns} #secondary-inner`, 'position', 'static'),
    rule(`${columns} #secondary-inner`, 'width', '100%'),
    // Keep only the playlist in the former sidebar. In narrow windows YouTube
    // already places its playlist in #below, before metadata and comments.
    rule(`${watch} #secondary-inner > :not(ytd-playlist-panel-renderer), ${watch} #related`, 'display', 'none'),
    rule(`${watch} ytd-playlist-panel-renderer`, 'margin-top', '20px'),
    rule(`${columns} #player-container-outer`, 'max-width', '100%'),
    rule(`${columns} #player-container-outer`, 'min-width', '0'),
    rule(`${columns} #player-container-outer`, 'width', '100%'),
    // Narrow desktop windows move the actual player out of #columns. Bound
    // that native container too, instead of leaving it edge-to-edge.
    rule(narrowPlayer, 'margin-top', '24px'),
    rule(narrowPlayer, 'height', 'auto'),
    rule(narrowPlayer, 'min-height', '0'),
    rule(narrowPlayer, 'max-height', 'none'),
    rule(`${narrowPlayer} > #player-full-bleed-container`, 'width', '100%'),
    rule(`${narrowPlayer} > #player-full-bleed-container`, 'height', 'auto'),
    rule(`${narrowPlayer} > #player-full-bleed-container`, 'aspect-ratio', ratio),
    rule(`${narrowPlayer} #player-container`, 'inset', '0'),
    rule(`${narrowPlayer} #player-container`, 'width', '100%'),
    rule(`${narrowPlayer} #player-container`, 'height', '100%'),
    rule(`${watch} #movie_player:not(.ytp-fullscreen)`, 'border-radius', '14px'),
    rule(`${watch} #movie_player:not(.ytp-fullscreen)`, 'overflow', 'hidden'),
  ]
}

export const CENTER_PLAYER_RULES: SelectorRule[] = getCenterPlayerRules('default')

// Target thumbnail media only: never the watch video, avatars, or title text.
export const BLUR_THUMBNAIL_RULES: SelectorRule[] = [
  rule('ytd-thumbnail img, ytd-thumbnail video, yt-thumbnail-view-model img, yt-thumbnail-view-model video, yt-collection-thumbnail-view-model img, ytd-playlist-thumbnail img, ytd-reel-item-renderer img, yt-shorts-lockup-view-model img, ytd-moving-thumbnail-renderer img, ytd-moving-thumbnail-renderer video', 'filter', 'blur(12px)'),
]
