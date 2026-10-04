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

it('shows Allow Search only beneath enabled Hide Explore and preserves its disabled selection', () => {
  const state = createDefaultState()
  state.instagram.allowExploreSearch = true
  useStore.setState({ state })
  expect(renderToStaticMarkup(<InstagramPanel />)).not.toContain('Allow Search')
  state.instagram.nukeExplore = true
  useStore.setState({ state: { ...state } })
  let markup = renderToStaticMarkup(<InstagramPanel />)
  expect(markup).toContain('Allow Search')
  const searchToggle = () => markup.match(/<button\b[^>]*aria-label="Allow Search"[^>]*>/)?.[0]
  expect(searchToggle()).toContain('aria-checked="true"')
  expect(searchToggle()).not.toContain('disabled=""')
  state.globalEnabled = false
  useStore.setState({ state: { ...state } })
  markup = renderToStaticMarkup(<InstagramPanel />)
  expect(searchToggle()).toContain('disabled=""')
  expect(searchToggle()).toContain('aria-checked="true"')
})
