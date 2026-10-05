// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import markup from './fixtures/instagram-notes.html?raw'
import { createDefaultState } from '../src/config/defaults'
import { getActiveRules } from '../src/content/instagram/rules'
import { updateStyles, unmountAll } from '../src/content/shared/injector'

afterEach(() => {
  unmountAll()
  document.body.innerHTML = ''
  history.replaceState(null, '', '/')
})

it('removes the whole text/music Notes carousel on DM routes and restores its display when disabled', () => {
  document.body.innerHTML = `<main>${markup}<div id="chats">Chats</div><textarea aria-label="Message"></textarea></main>`
  const state = createDefaultState()
  state.instagram.nukeNotes = true
  for (const path of ['/direct', '/direct/inbox/', '/direct/t/example/']) {
    history.replaceState(null, '', path)
    updateStyles(getActiveRules(state))
    expect(getComputedStyle(document.getElementById('notes-row')!).display).toBe('none')
    expect(getComputedStyle(document.getElementById('chats')!).display).not.toBe('none')
    expect(getComputedStyle(document.querySelector('textarea')!).display).not.toBe('none')
  }
  state.instagram.nukeNotes = false
  updateStyles(getActiveRules(state))
  expect(getComputedStyle(document.getElementById('notes-row')!).display).toBe('flex')
  state.instagram.nukeNotes = true
  state.globalEnabled = false
  updateStyles(getActiveRules(state))
  expect(getComputedStyle(document.getElementById('notes-row')!).display).toBe('flex')
})

it('does not hide unrelated carousels, conversation lists, or route lookalikes', () => {
  document.body.innerHTML = `${markup}<ul id="conversations"><li><button>Conversation</button></li></ul>
    <div id="other-carousel"><div><div role="presentation" data-interactable="|click|"><div><ul>
      <li style="transform:translateX(0px)"><div role="button"><span role="link"><img alt="Profile"></span></div></li>
    </ul></div></div></div></div>`
  const state = createDefaultState()
  state.instagram.nukeNotes = true
  history.replaceState(null, '', '/direct/inbox/')
  updateStyles(getActiveRules(state))
  for (const id of ['other-carousel', 'conversations']) {
    expect(getComputedStyle(document.getElementById(id)!).display).not.toBe('none')
  }
  for (const path of ['/', '/alice/', '/directory/']) {
    history.replaceState(null, '', path)
    updateStyles(getActiveRules(state))
    expect(getComputedStyle(document.getElementById('notes-row')!).display).toBe('flex')
  }
})
