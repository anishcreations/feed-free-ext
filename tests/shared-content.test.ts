// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { updateStyles, removeAntiflicker, unmountAll } from '../src/content/shared/injector'
import { DOMPatron } from '../src/content/shared/patron'

let patron: DOMPatron | undefined
afterEach(() => { patron?.disconnect(); document.head.innerHTML = ''; document.body.innerHTML = ''; history.replaceState(null, '', '/') })

it('updates one stylesheet, includes fallbacks, and restores content when rules are removed', () => {
  document.body.innerHTML = '<div class="primary">A</div><div class="fallback">B</div>'
  const rules = [{ name: 'sample', selectors: [{ selector: '.primary', fallbacks: ['.fallback'], property: 'display', value: 'none' }] }]
  expect(updateStyles(rules)).toBe(true)
  expect(getComputedStyle(document.querySelector('.primary')!).display).toBe('none')
  expect(getComputedStyle(document.querySelector('.fallback')!).display).toBe('none')
  expect(updateStyles(rules)).toBe(false)
  expect(document.querySelectorAll('#feed-free-style')).toHaveLength(1)
  expect(updateStyles([])).toBe(true)
  expect(getComputedStyle(document.querySelector('.primary')!).display).not.toBe('none')
  const bootstrap = document.createElement('style')
  bootstrap.id = 'ff-antiflicker'
  document.head.append(bootstrap)
  updateStyles(rules)
  removeAntiflicker()
  expect(document.getElementById('ff-antiflicker')).toBeNull()
  expect(document.getElementById('feed-free-style')).not.toBeNull()
  unmountAll()
  expect(document.getElementById('feed-free-style')).toBeNull()
})

it('detects changed URLs on real DOM mutations, ignores its own style mutations, and stops on disconnect', async () => {
  const navigate = vi.fn(() => updateStyles([{ name: 'test', selectors: [{ selector: '.feed', fallbacks: [], property: 'display', value: 'none' }] }]))
  patron = new DOMPatron(navigate)
  patron.start()
  patron.start()
  history.pushState(null, '', '/explore/')
  document.body.append(document.createElement('main'))
  await vi.waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
  document.body.append(document.createElement('div'))
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(navigate).toHaveBeenCalledTimes(1)
  history.pushState(null, '', '/explore/search/')
  document.body.append(document.createElement('input'))
  await vi.waitFor(() => expect(navigate).toHaveBeenCalledTimes(2))
  patron.disconnect()
  history.pushState(null, '', '/')
  document.body.append(document.createElement('div'))
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(navigate).toHaveBeenCalledTimes(2)
})
