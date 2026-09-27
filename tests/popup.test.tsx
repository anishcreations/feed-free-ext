import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'
import { createDefaultState } from '../src/config/defaults'
import { InstagramPanel } from '../src/popup/components/InstagramPanel'
import { useStore } from '../src/popup/store'

vi.mock('../src/popup/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/popup/store')>()
  return {
    useStore: Object.assign(
      (selector: (store: ReturnType<typeof actual.useStore.getState>) => unknown) => selector(actual.useStore.getState()),
      actual.useStore,
    ),
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  useStore.setState({ state: createDefaultState() })
})

it.each([true, false])('DM conflict destination respects global enabled=%s without losing its selection', (globalEnabled) => {
  const state = createDefaultState()
  state.globalEnabled = globalEnabled
  state.instagram.nukeMainFeed = true
  state.instagram.blockDMs = true
  state.instagram.conflictRedirectTarget = 'saved'
  useStore.setState({ state })

  const markup = renderToStaticMarkup(<InstagramPanel />)
  const select = markup.match(/<select\b[^>]*>/)?.[0]
  expect(select).toBeDefined()
  expect(select?.includes('disabled=""')).toBe(!globalEnabled)
  expect(markup).toContain('<option value="saved" selected="">Saved</option>')
})
