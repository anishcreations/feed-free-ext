import type { FeedFreeState } from '../types'
import { STORAGE_KEY, CURRENT_VERSION, createDefaultState } from '../config/defaults'

type MigrationFn = (data: Record<string, unknown>) => Record<string, unknown>

const migrations: Record<string, MigrationFn> = {
  '1.0.0': (data) => {
    delete data.lock
    const yt = data.youtube as Record<string, unknown> | undefined
    if (yt) delete yt.showUnbiasedFeed
    const ig = data.instagram as Record<string, unknown> | undefined
    if (ig) delete ig.showUnbiasedFeed
    return data
  },
  '1.2.0': (data) => {
    const ig = data.instagram as Record<string, unknown> | undefined
    if (ig) {
      if ('hideLikesCounts' in ig) {
        ig.hideLikes = !!ig.hideLikesCounts
      } else if (!('hideLikes' in ig)) {
        ig.hideLikes = false
      }

      if ('nukeComments' in ig || 'hideCommentsCounts' in ig) {
        ig.hideComments = !!ig.nukeComments || !!ig.hideCommentsCounts
      } else if (!('hideComments' in ig)) {
        ig.hideComments = false
      }

      delete ig.hideLikesCounts
      delete ig.hideCommentsCounts
      delete ig.nukeComments
    }
    return data
  },
}

function applyMigrations(raw: Record<string, unknown>): FeedFreeState {
  // Consolidate the legacy sidebar switch even for an existing development
  // build at CURRENT_VERSION. Preserve whether the user had hidden playlists.
  const youtube = { ...(raw.youtube as Record<string, unknown> | undefined) }
  if ('nukeSidebar' in youtube) {
    if (youtube.nukeSidebar && !youtube.centerPlayer) {
      youtube.centerPlayer = true
      youtube.keepPlaylist ??= false
    }
    delete youtube.nukeSidebar
  }
  const normalized = { ...raw, youtube }
  const currentVersion = (raw.version as string) || '0.0.0'

  if (currentVersion === CURRENT_VERSION) {
    return normalized as unknown as FeedFreeState
  }

  let migrated: Record<string, unknown> = { ...normalized }
  const versionKeys = Object.keys(migrations).sort()

  for (const version of versionKeys) {
    migrated = migrations[version](migrated)
    migrated.version = version
  }

  // Force strip lock if it still exists
  delete migrated.lock
  migrated.version = CURRENT_VERSION
  return migrated as unknown as FeedFreeState
}

export async function loadState(): Promise<FeedFreeState> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    const raw = result[STORAGE_KEY]
    if (!raw) {
      const defaults = createDefaultState()
      await chrome.storage.local.set({ [STORAGE_KEY]: defaults })
      return defaults
    }
    const migrated = applyMigrations(raw)
    
    // Deep merge migrated state with defaults to ensure all keys exist (e.g. grayMode)
    const defaults = createDefaultState()
    const merged: FeedFreeState = {
      ...defaults,
      ...migrated,
      version: CURRENT_VERSION,
      youtube: { ...defaults.youtube, ...migrated.youtube },
      instagram: { ...defaults.instagram, ...migrated.instagram },
    }
    
    if (JSON.stringify(raw) !== JSON.stringify(merged)) {
      await chrome.storage.local.set({ [STORAGE_KEY]: merged })
    }
    return merged
  } catch {
    const defaults = createDefaultState()
    await chrome.storage.local.set({ [STORAGE_KEY]: defaults })
    return defaults
  }
}

export async function saveState(state: FeedFreeState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: state })
}

export function onStateChanged(
  callback: (state: FeedFreeState) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      // A removed key has no newValue. Consumers must always receive usable state.
      callback((changes[STORAGE_KEY].newValue as FeedFreeState | undefined) ?? createDefaultState())
    }
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}

const POLL_INTERVAL = 2000

export function pollState(
  callback: (state: FeedFreeState) => void,
): () => void {
  let lastJson = ''
  const id = setInterval(async () => {
    try {
      const state = await loadState()
      const json = JSON.stringify(state)
      if (json !== lastJson) {
        lastJson = json
        callback(state)
      }
    } catch {
      /* silent */
    }
  }, POLL_INTERVAL)
  return () => clearInterval(id)
}
