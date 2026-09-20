import { normalizeBlurLevel } from '../../config/thumbnailBlur'
import { getSelectorEntries } from '../../config/selectors'
import type { FeedFreeState, SelectorRule } from '../../types'

export type YouTubeRuleKey =
  | 'homeFeed'
  | 'shorts'
  | 'sidebarRecs'
  | 'hideWatchPlaylist'
  | 'centerPlayer'
  | 'blurThumbnails'
  | 'comments'
  | 'musicOnly'
  | 'grayMode'
  | 'endScreens'
  | 'subscriptions'
  | 'explore'
  | 'reportHistory'
  | 'notifications'
  | 'moreFromYouTube'
  | 'shortsProfiles'
  | 'searchShorts'

export interface ActiveRule {
  name: YouTubeRuleKey
  selectors: SelectorRule[]
}

const RULE_MAP: Record<YouTubeRuleKey, string> = {
  homeFeed: 'homeFeed',
  shorts: 'shorts',
  sidebarRecs: 'sidebarRecs',
  hideWatchPlaylist: 'hideWatchPlaylist',
  centerPlayer: 'centerPlayer',
  blurThumbnails: 'blurThumbnails',
  comments: 'comments',
  musicOnly: 'musicOnly',
  grayMode: 'grayMode',
  endScreens: 'endScreens',
  subscriptions: 'subscriptions',
  explore: 'explore',
  reportHistory: 'reportHistory',
  notifications: 'notifications',
  moreFromYouTube: 'moreFromYouTube',
  shortsProfiles: 'shortsProfiles',
  searchShorts: 'searchShorts',
}

export function getActiveRules(state: FeedFreeState): ActiveRule[] {
  const rules: ActiveRule[] = []

  if (!state.globalEnabled) {
    if (state.youtube.musicOnlyMode) {
      rules.push({
        name: 'musicOnly',
        selectors: getSelectorEntries('youtube', RULE_MAP.musicOnly),
      })
    }
    if (state.youtube.grayMode) {
      rules.push({
        name: 'grayMode',
        selectors: getSelectorEntries('youtube', RULE_MAP.grayMode),
      })
    }
    return rules
  }

  // YouTube updates the URL before removing the previous page's DOM. Keep
  // these home-scoped selectors active so the outgoing feed cannot flash.
  if (state.youtube.nukeHomeFeed) {
    rules.push({
      name: 'homeFeed',
      selectors: getSelectorEntries('youtube', RULE_MAP.homeFeed),
    })
  }
  if (state.youtube.nukeShorts) {
    rules.push({
      name: 'shorts',
      selectors: getSelectorEntries('youtube', RULE_MAP.shorts),
    })
  }
  if (state.youtube.nukeShortsFromProfiles) {
    rules.push({
      name: 'shortsProfiles',
      selectors: getSelectorEntries('youtube', RULE_MAP.shortsProfiles),
    })
  }
  if (state.youtube.nukeSearchShorts) {
    rules.push({
      name: 'searchShorts',
      selectors: getSelectorEntries('youtube', RULE_MAP.searchShorts),
    })
  }
  if (state.youtube.nukeSidebarRecs) {
    rules.push({
      name: 'sidebarRecs',
      selectors: getSelectorEntries('youtube', RULE_MAP.sidebarRecs),
    })
  }
  if (state.youtube.centerPlayer && !state.youtube.keepPlaylist) {
    rules.push({
      name: 'hideWatchPlaylist',
      selectors: getSelectorEntries('youtube', RULE_MAP.hideWatchPlaylist),
    })
  }
  for (const name of ['centerPlayer', 'blurThumbnails'] as const) {
    if (state.youtube[name]) {
      const selectors = getSelectorEntries('youtube', RULE_MAP[name])
      rules.push({
        name,
        selectors: name === 'blurThumbnails'
          ? selectors.map(rule => ({ ...rule, value: `blur(${normalizeBlurLevel(state.youtube.thumbnailBlurLevel)}px)` }))
          : selectors,
      })
    }
  }
  if (state.youtube.nukeComments) {
    rules.push({
      name: 'comments',
      selectors: getSelectorEntries('youtube', RULE_MAP.comments),
    })
  }
  if (state.youtube.nukeEndScreens) {
    rules.push({
      name: 'endScreens',
      selectors: getSelectorEntries('youtube', RULE_MAP.endScreens),
    })
  }
  if (state.youtube.nukeSubscriptions) {
    rules.push({
      name: 'subscriptions',
      selectors: getSelectorEntries('youtube', RULE_MAP.subscriptions),
    })
  }
  if (state.youtube.nukeExplore) {
    rules.push({
      name: 'explore',
      selectors: getSelectorEntries('youtube', RULE_MAP.explore),
    })
  }
  if (state.youtube.nukeReportHistory) {
    rules.push({
      name: 'reportHistory',
      selectors: getSelectorEntries('youtube', RULE_MAP.reportHistory),
    })
  }
  if (state.youtube.nukeNotifications) {
    rules.push({
      name: 'notifications',
      selectors: getSelectorEntries('youtube', RULE_MAP.notifications),
    })
  }
  if (state.youtube.nukeMoreFromYouTube) {
    rules.push({
      name: 'moreFromYouTube',
      selectors: getSelectorEntries('youtube', RULE_MAP.moreFromYouTube),
    })
  }
  if (state.youtube.musicOnlyMode) {
    rules.push({
      name: 'musicOnly',
      selectors: getSelectorEntries('youtube', RULE_MAP.musicOnly),
    })
  }
  if (state.youtube.grayMode) {
    rules.push({
      name: 'grayMode',
      selectors: getSelectorEntries('youtube', RULE_MAP.grayMode),
    })
  }

  return rules
}
