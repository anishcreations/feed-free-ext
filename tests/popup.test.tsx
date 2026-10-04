// @vitest-environment jsdom
import React from 'react'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createDefaultState, STORAGE_KEY } from '../src/config/defaults'
import { InstagramPanel } from '../src/popup/components/InstagramPanel'
import { useStore } from '../src/popup/store'
import { createChromeStorage } from './helpers/chrome'

let api: ReturnType<typeof createChromeStorage>
beforeEach(() => {
  api = createChromeStorage({ [STORAGE_KEY]: createDefaultState() })
  vi.stubGlobal('chrome', api)
  useStore.setState({ state: createDefaultState(), loaded: false })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('toggles Explore and its child through real React subscriptions, saves, and broadcasts', async () => {
  const user = userEvent.setup()
  const view = render(<InstagramPanel />)
  expect(screen.queryByRole('switch', { name: 'Allow Search' })).toBeNull()
  await user.click(screen.getByRole('switch', { name: 'Hide Explore' }))
  const child = await screen.findByRole('switch', { name: 'Allow Search' })
  expect(child.getAttribute('aria-checked')).toBe('false')
  await user.click(child)
  await waitFor(() => expect(child.getAttribute('aria-checked')).toBe('true'))
  expect(api.read(STORAGE_KEY)).toMatchObject({ instagram: { nukeExplore: true, allowExploreSearch: true } })
  await waitFor(() => expect(api.tabs.sendMessage).toHaveBeenLastCalledWith(7, {
    type: 'feedfree:state', state: expect.objectContaining({ instagram: expect.objectContaining({ allowExploreSearch: true }) }),
  }))
  await user.click(screen.getByRole('switch', { name: 'Hide Explore' }))
  await waitFor(() => expect(screen.queryByRole('switch', { name: 'Allow Search' })).toBeNull())
  await user.click(screen.getByRole('switch', { name: 'Hide Explore' }))
  expect((await screen.findByRole('switch', { name: 'Allow Search' })).getAttribute('aria-checked')).toBe('true')
  // A fresh store initialization reads persisted settings rather than retaining the render's state.
  view.unmount()
  useStore.setState({ state: createDefaultState(), loaded: false })
  const stop = useStore.getState().init()
  await waitFor(() => expect(useStore.getState().loaded).toBe(true))
  render(<InstagramPanel />)
  expect(screen.getByRole('switch', { name: 'Allow Search' }).getAttribute('aria-checked')).toBe('true')
  stop()
})

it('allows choosing the home redirect destination directly and disables blocked options', async () => {
  const user = userEvent.setup()
  render(<InstagramPanel />)
  expect(screen.queryByRole('combobox', { name: 'Redirect destination' })).toBeNull()
  await user.click(screen.getByRole('switch', { name: 'Redirect Home' }))
  const select = await screen.findByRole('combobox', { name: 'Redirect destination' }) as HTMLSelectElement
  expect(select).not.toBeNull()
  await user.selectOptions(select, 'saved')
  await waitFor(() => expect(api.read(STORAGE_KEY)).toMatchObject({ instagram: { homeRedirectTarget: 'saved' } }))
  await user.selectOptions(select, 'profile')
  await waitFor(() => expect(api.read(STORAGE_KEY)).toMatchObject({ instagram: { homeRedirectTarget: 'profile' } }))
  await user.selectOptions(select, 'following')
  await waitFor(() => expect(api.read(STORAGE_KEY)).toMatchObject({ instagram: { homeRedirectTarget: 'following', forceChronological: true } }))
  await user.click(screen.getByRole('switch', { name: 'Hide DMs' }))
  const dmsOption = select.querySelector('option[value="dms"]') as HTMLOptionElement
  expect(dmsOption.disabled).toBe(true)
  await act(async () => { await useStore.getState().setGlobal(false) })
  expect(select.disabled).toBe(true)
})

it('restores defaults in a mounted popup after the storage key is cleared', async () => {
  const initial = createDefaultState()
  initial.instagram.nukeExplore = true
  await api.storage.local.set({ [STORAGE_KEY]: initial })
  const stop = useStore.getState().init()
  await waitFor(() => expect(useStore.getState().loaded).toBe(true))
  render(<InstagramPanel />)
  expect(screen.queryByRole('switch', { name: 'Allow Search' })).not.toBeNull()
  await act(async () => { await api.storage.local.clear() })
  expect(screen.queryByRole('switch', { name: 'Allow Search' })).toBeNull()
  expect(screen.getByRole('switch', { name: 'Hide Explore' }).getAttribute('aria-checked')).toBe('false')
  stop()
})

it.each([false, true])('Hide DMs forces the floating child on, then restores its saved choice (%s)', async (preference) => {
  const user = userEvent.setup()
  render(<InstagramPanel />)
  const child = screen.getByRole('switch', { name: 'Hide Floating Messages' }) as HTMLButtonElement
  expect(child.disabled).toBe(false)
  expect(child.getAttribute('aria-checked')).toBe('false')
  if (preference) await user.click(child)
  await user.click(screen.getByRole('switch', { name: 'Hide DMs', exact: true }))
  await waitFor(() => expect(child.disabled).toBe(true))
  expect(child.getAttribute('aria-checked')).toBe('true')
  await user.click(child)
  expect(api.read(STORAGE_KEY)).toMatchObject({ instagram: { blockDMs: true, hideFloatingDMs: preference } })
  await user.click(screen.getByRole('switch', { name: 'Hide DMs', exact: true }))
  await waitFor(() => expect(child.disabled).toBe(false))
  expect(child.getAttribute('aria-checked')).toBe(String(preference))
  await act(async () => { await useStore.getState().setGlobal(false) })
  expect(child.disabled).toBe(true)
  expect(child.getAttribute('aria-checked')).toBe(String(preference))
})
