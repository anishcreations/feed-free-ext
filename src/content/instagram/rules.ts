import { isExploreLanding } from './explore'
import { getSelectorEntries } from '../../config/selectors'
import type { FeedFreeState, SelectorRule } from '../../types'

export type InstagramRuleKey =
  | 'mainFeed'
  | 'reels'
  | 'explore'
  | 'exploreFeed'
  | 'dms'
  | 'floatingDMs'
  | 'grayMode'
  | 'squareProfile'
  | 'notifications'
  | 'comments'
  | 'notes'
  | 'likes'
  | 'storiesHome'
  | 'storiesEverywhere'
  | 'dashboard'

export interface ActiveRule {
  name: InstagramRuleKey
  selectors: SelectorRule[]
}

const RULE_MAP: Record<InstagramRuleKey, string> = {
  mainFeed: 'mainFeed',
  reels: 'reels',
  explore: 'explore',
  exploreFeed: 'exploreFeed',
  dms: 'dms',
  floatingDMs: 'floatingDMs',
  grayMode: 'grayMode',
  squareProfile: 'squareProfile',
  notifications: 'notifications',
  comments: 'comments',
  notes: 'notes',
  likes: 'likes',
  storiesHome: 'storiesHome',
  storiesEverywhere: 'storiesEverywhere',
  dashboard: 'dashboard',
}

export function getActiveRules(state: FeedFreeState): ActiveRule[] {
  const rules: ActiveRule[] = []

  if (!state.globalEnabled) {
    if (state.instagram.grayMode) {
      rules.push({
        name: 'grayMode',
        selectors: getSelectorEntries('instagram', RULE_MAP.grayMode),
      })
    }
    return rules
  }

  const isHomepage = window.location.pathname === '/' || window.location.pathname === ''
  const isFollowing = typeof window !== 'undefined' && !!window.location?.search?.includes('variant=following')
  const wantsFollowing = state.instagram.homeRedirectTarget === 'following' || state.instagram.forceChronological

  if (state.instagram.nukeMainFeed && isHomepage && (!wantsFollowing || !isFollowing)) {
    rules.push({
      name: 'mainFeed',
      selectors: getSelectorEntries('instagram', RULE_MAP.mainFeed),
    })
  }
  if (state.instagram.nukeReels) {
    rules.push({
      name: 'reels',
      selectors: getSelectorEntries('instagram', RULE_MAP.reels),
    })
  }
  if (state.instagram.nukeExplore) {
    if (!state.instagram.allowExploreSearch) {
      rules.push({
        name: 'explore',
        selectors: getSelectorEntries('instagram', RULE_MAP.explore),
      })
    }
    if (isExploreLanding(window.location.pathname)) {
      rules.push({
        name: 'exploreFeed',
        selectors: getSelectorEntries('instagram', RULE_MAP.exploreFeed),
      })
    }
  }
  if (state.instagram.blockDMs) {
    rules.push({
      name: 'dms',
      selectors: getSelectorEntries('instagram', RULE_MAP.dms),
    })
  }
  if (state.instagram.blockDMs || state.instagram.hideFloatingDMs) {
    rules.push({
      name: 'floatingDMs',
      selectors: getSelectorEntries('instagram', RULE_MAP.floatingDMs),
    })
  }
  if (state.instagram.grayMode) {
    rules.push({
      name: 'grayMode',
      selectors: getSelectorEntries('instagram', RULE_MAP.grayMode),
    })
  }
  if (state.instagram.squareProfile) {
    rules.push({
      name: 'squareProfile',
      selectors: getSelectorEntries('instagram', RULE_MAP.squareProfile),
    })
  }
  if (state.instagram.nukeNotifications) {
    rules.push({
      name: 'notifications',
      selectors: getSelectorEntries('instagram', RULE_MAP.notifications),
    })
  }
  if (state.instagram.hideComments) {
    rules.push({
      name: 'comments',
      selectors: getSelectorEntries('instagram', RULE_MAP.comments),
    })
  }
  if (state.instagram.nukeNotes) {
    rules.push({
      name: 'notes',
      selectors: getSelectorEntries('instagram', RULE_MAP.notes),
    })
  }
  if (state.instagram.hideLikes) {
    rules.push({
      name: 'likes',
      selectors: getSelectorEntries('instagram', RULE_MAP.likes),
    })
  }
  if (state.instagram.nukeStoriesHome || state.instagram.nukeStoriesEverywhere) {
    rules.push({
      name: 'storiesHome',
      selectors: getSelectorEntries('instagram', RULE_MAP.storiesHome),
    })
  }
  if (state.instagram.nukeStoriesEverywhere) {
    rules.push({
      name: 'storiesEverywhere',
      selectors: getSelectorEntries('instagram', RULE_MAP.storiesEverywhere),
    })
  }
  if (state.instagram.nukeDashboard) {
    rules.push({
      name: 'dashboard',
      selectors: getSelectorEntries('instagram', RULE_MAP.dashboard),
    })
  }

  return rules
}
