// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { createDefaultState } from '../src/config/defaults'
import { handleRedirect } from '../src/content/instagram/redirect'

afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals() })

function page(pathname: string, profile = false) {
  document.body.innerHTML = `<nav><a href="/explore/">Explore</a>${profile ? '<a href="/alice/">Profile</a>' : ''}</nav>`
  const location = { pathname, href: `https://www.instagram.com${pathname}`, replace: vi.fn() }
  vi.stubGlobal('location', location)
  return location
}

it.each(['profile', 'saved'] as const)('does not bounce back to DMs when the %s destination is missing', target => {
  const state = createDefaultState()
  Object.assign(state.instagram, { nukeMainFeed: true, blockDMs: true, conflictRedirectTarget: target })
  const direct = page('/direct/inbox/')
  expect(handleRedirect(state)).toBe(true)
  expect(direct.replace).toHaveBeenCalledWith('/')
  const home = page('/')
  expect(handleRedirect(state)).toBe(false)
  expect(home.replace).not.toHaveBeenCalled()
  // When the profile link arrives, the same handler can resolve the requested destination.
  document.querySelector('nav')!.insertAdjacentHTML('beforeend', '<a href="/alice/">Profile</a>')
  expect(handleRedirect(state)).toBe(true)
  expect(home.replace).toHaveBeenCalledWith(target === 'saved' ? '/alice/saved/' : '/alice/')
})

it('redirects home to DMs only when DMs are allowed, and leaves the destination alone', () => {
  const state = createDefaultState()
  state.instagram.nukeMainFeed = true
  const home = page('/')
  expect(handleRedirect(state)).toBe(true)
  expect(home.replace).toHaveBeenCalledWith('/direct/inbox/')
  const direct = page('/direct/inbox/')
  expect(handleRedirect(state)).toBe(false)
  expect(direct.replace).not.toHaveBeenCalled()
})

it.each([
  ['profile', '/alice/'],
  ['saved', '/alice/saved/'],
] as const)('redirects home directly to %s without needing DMs blocked', (target, expectedPath) => {
  const state = createDefaultState()
  state.instagram.nukeMainFeed = true
  state.instagram.homeRedirectTarget = target
  const home = page('/', true)
  expect(handleRedirect(state)).toBe(true)
  expect(home.replace).toHaveBeenCalledWith(expectedPath)
})

it('redirects home directly to following feed and avoids repeating when variant is present', () => {
  const state = createDefaultState()
  state.instagram.nukeMainFeed = true
  state.instagram.homeRedirectTarget = 'following'
  const home = page('/', true)
  expect(handleRedirect(state)).toBe(true)
  expect(home.replace).toHaveBeenCalledWith('https://www.instagram.com/?variant=following')

  const following = page('/?variant=following', true)
  expect(handleRedirect(state)).toBe(false)
  expect(following.replace).not.toHaveBeenCalled()
})

it('enforces Explore blocking through the actual redirect handler and respects search/master switches', () => {
  const state = createDefaultState()
  state.instagram.nukeExplore = true
  const location = page('/explore/', true)
  expect(handleRedirect(state)).toBe(true)
  expect(location.replace).toHaveBeenCalledWith('/alice/')
  location.replace.mockClear()
  state.instagram.allowExploreSearch = true
  expect(handleRedirect(state)).toBe(false)
  state.instagram.allowExploreSearch = false
  state.globalEnabled = false
  expect(handleRedirect(state)).toBe(false)
  expect(location.replace).not.toHaveBeenCalled()
})

it('does not redirect a signed-out page', () => {
  const state = createDefaultState()
  state.instagram.nukeExplore = true
  const location = page('/explore/')
  document.body.innerHTML = '<a href="/accounts/login/">Log in</a>'
  expect(handleRedirect(state)).toBe(false)
  expect(location.replace).not.toHaveBeenCalled()
})

it('keeps the inbox accessible when only floating messages are hidden', () => {
  const state = createDefaultState()
  state.instagram.hideFloatingDMs = true
  const direct = page('/direct/inbox/', true)
  expect(handleRedirect(state)).toBe(false)
  expect(direct.replace).not.toHaveBeenCalled()
})

it.each(['Inicio', 'Accueil', 'Startseite', 'ホーム'])('recognizes localized navigation (%s) without a readable login cookie', homeLabel => {
  const state = createDefaultState()
  state.instagram.nukeExplore = true
  const location = page('/explore/')
  document.body.innerHTML = `<nav>
    <svg aria-label="${homeLabel}"></svg><svg aria-label="Mensajes"></svg>
    <a href="/alice/">Perfil</a>
  </nav>`
  expect(document.cookie).not.toMatch(/(?:^|;\s*)ds_user_id=/)
  expect(handleRedirect(state)).toBe(true)
  expect(location.replace).toHaveBeenCalledWith('/alice/')
})

it.each(['nav', 'header', 'div role="navigation"'])('recognizes unlabeled stable route links inside %s', container => {
  const state = createDefaultState()
  state.instagram.nukeExplore = true
  const location = page('/explore/')
  const tag = container.split(' ')[0]
  document.body.innerHTML = `<${container}><a href="/direct/inbox/"><svg></svg></a><a href="/alice/">Me</a></${tag}>`
  expect(handleRedirect(state)).toBe(true)
  expect(location.replace).toHaveBeenCalledWith('/alice/')
})

it('does not mistake post links or decorative English icons for authenticated navigation', () => {
  const state = createDefaultState()
  state.instagram.nukeExplore = true
  const location = page('/explore/')
  document.body.innerHTML = '<header><a href="/">Instagram</a><a href="/accounts/login/">Log in</a></header><main><article><a href="/explore/">Explore</a><a href="/alice/">Author</a><svg aria-label="Home"></svg></article></main>'
  expect(handleRedirect(state)).toBe(false)
  expect(location.replace).not.toHaveBeenCalled()
})

it('does not redirect an account login page even if navigation is left in the DOM', () => {
  const state = createDefaultState()
  state.instagram.nukeMainFeed = true
  state.instagram.nukeExplore = true
  const location = page('/accounts/login/', true)
  expect(handleRedirect(state)).toBe(false)
  expect(location.replace).not.toHaveBeenCalled()
})

it.each([
  ['blockDMs', '/direct/inbox/', '/alice/'],
  ['nukeReels', '/reels/', '/alice/'],
  ['nukeNotifications', '/notifications/', '/alice/'],
  ['nukeNotifications', '/accounts/activity/', '/alice/'],
  ['nukeDashboard', '/alice/dashboard/', '/alice/'],
  ['nukeStoriesEverywhere', '/stories/alice/', '/alice/'],
  ['nukeMainFeed', '/', '/direct/inbox/'],
] as const)('localized navigation permits %s to enforce its redirect', (feature, path, destination) => {
  const state = createDefaultState()
  state.instagram[feature] = true
  const location = page(path)
  document.body.innerHTML = '<div role="navigation"><a href="/"><svg aria-label="ホーム"></svg></a><a href="/alice/">プロフィール</a></div>'
  expect(handleRedirect(state)).toBe(true)
  expect(location.replace).toHaveBeenCalledExactlyOnceWith(destination)
})

it.each([
  '<nav><svg aria-label="Inicio"></svg></nav>',
  '<nav><a href="https://example.com/direct/inbox/">Other site</a></nav>',
  '<nav><a href="/explorer/">Public directory</a></nav>',
  '<nav><a href="/accounts/login/">Entrar</a><a href="/alice/">Perfil</a><svg></svg></nav>',
])('does not infer login from insufficient navigation evidence: %s', markup => {
  const state = createDefaultState()
  state.instagram.nukeExplore = true
  const location = page('/explore/')
  document.body.innerHTML = markup
  expect(handleRedirect(state)).toBe(false)
  expect(location.replace).not.toHaveBeenCalled()
})
