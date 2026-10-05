// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDefaultState } from '../src/config/defaults'
import { getActiveRules } from '../src/content/instagram/rules'
import { updateStyles, unmountAll } from '../src/content/shared/injector'
import { syncInstagramNavItems } from '../src/content/instagram/nav-items'

const isDisplayed = (id: string) => getComputedStyle(document.getElementById(id)!).display !== 'none'
function apply(state: ReturnType<typeof createDefaultState>) {
  updateStyles(getActiveRules(state))
  syncInstagramNavItems(state)
}
afterEach(() => {
  syncInstagramNavItems(createDefaultState())
  unmountAll()
  document.body.innerHTML = ''
})

describe('Professional Dashboard navigation', () => {
  it('hides the observed Afrikaans sidebar dashboard with a fragment-only link and restores it on disable', () => {
    document.body.innerHTML = '<div id="sidebar"><a id="home" href="/">Tuisblad</a><a id="dashboard" href="#"><span>Professionele beheerpaneel</span></a><a id="profile" href="/alice/">Profiel</a></div>'
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    expect(isDisplayed('dashboard')).toBe(false)
    for (const id of ['sidebar', 'home', 'profile']) expect(isDisplayed(id), id).toBe(true)
    state.instagram.nukeDashboard = false
    apply(state)
    expect(isDisplayed('dashboard')).toBe(true)
  })

  it.each([
    'व्यावसायिक ड्यासबोर्ड', 'प्रोफेशनल डैशबोर्ड', 'Panel para profesionales',
    'Painel profissional', 'Tableau de bord professionnel', 'Professional-Dashboard',
    'プロフェッショナルダッシュボード', '프로페셔널 대시보드', 'لوحة المعلومات الاحترافية',
  ])('hides a translated dashboard label with a subtitle: %s', label => {
    document.body.innerHTML = `<header id="profile"><div id="banner" role="button"><span>${label}</span><span>100 accounts reached</span></div><a id="edit" href="/accounts/edit/">Edit profile</a></header>`
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    expect(isDisplayed('banner')).toBe(false)
    expect(isDisplayed('profile')).toBe(true)
    expect(isDisplayed('edit')).toBe(true)
  })

  it.each(['/professional_dashboard/', '/accounts/insights/', '/alice/dashboard/', '/alice/professional-dashboard/'])('uses the stable route without recognizing the label: %s', route => {
    document.body.innerHTML = `<header><a id="dashboard" href="${route}">Unknown language</a><a id="edit" href="/accounts/edit/">Edit</a></header>`
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    expect(isDisplayed('dashboard')).toBe(false)
    expect(isDisplayed('edit')).toBe(true)
  })

  it('ignores unrelated professional text, post controls, external links, and broad parent containers', () => {
    document.body.innerHTML = `<main id="root">
      <header id="profile"><a id="dashboard" href="/alice/dashboard/">Unknown language</a><a id="edit" href="/accounts/edit/">Edit</a></header>
      <button id="business">व्यावसायिक</button><button id="information">Informações</button>
      <a id="external" href="https://example.com/dashboard/">Read a tutorial</a>
      <a id="lookalike" href="/dashboard_design/">Design</a>
      <article><button id="post">Professional dashboard</button></article>
      <div role="dialog"><button id="dialog">Professional dashboard</button></div>
      <div id="wrapper" role="button"><button>Dashboard</button><button>Another control</button></div>
    </main>`
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    expect(isDisplayed('dashboard')).toBe(false)
    for (const id of ['root', 'profile', 'edit', 'business', 'information', 'external', 'lookalike', 'post', 'dialog', 'wrapper']) expect(isDisplayed(id), id).toBe(true)
  })

  it('restores page-owned display styles after feature or master disable', () => {
    document.body.innerHTML = '<button id="dashboard" style="display:inline-flex">Dashboard</button>'
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    expect(isDisplayed('dashboard')).toBe(false)
    state.instagram.nukeDashboard = false
    apply(state)
    expect(getComputedStyle(document.getElementById('dashboard')!).display).toBe('inline-flex')
    state.instagram.nukeDashboard = true
    apply(state)
    expect(isDisplayed('dashboard')).toBe(false)
    state.globalEnabled = false
    apply(state)
    expect(getComputedStyle(document.getElementById('dashboard')!).display).toBe('inline-flex')
  })

  it('restores hidden controls detached by a rerender before the master switch is disabled', () => {
    document.body.innerHTML = '<button id="dashboard" style="display:inline-flex">Dashboard</button>'
    const dashboard = document.getElementById('dashboard')!
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    dashboard.remove()
    state.globalEnabled = false
    apply(state)
    document.body.append(dashboard)
    expect(getComputedStyle(dashboard).display).toBe('inline-flex')
    expect(dashboard.hasAttribute('data-ff-dashboard-hidden')).toBe(false)
  })

  it('restores the latest display style after the page changes a hidden control', () => {
    document.body.innerHTML = '<button id="dashboard" style="display:inline-flex">Dashboard</button>'
    const dashboard = document.getElementById('dashboard')!
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    dashboard.style.setProperty('display', 'grid', 'important')
    apply(state)
    expect(isDisplayed('dashboard')).toBe(false)
    state.instagram.nukeDashboard = false
    apply(state)
    expect(dashboard.style.getPropertyValue('display')).toBe('grid')
    expect(dashboard.style.getPropertyPriority('display')).toBe('important')
  })

  it('does not hide external controls labelled like Instagram controls', () => {
    document.body.innerHTML = '<a id="dashboard" href="https://example.com/dashboard/">Professional dashboard</a><a id="notifications" href="https://example.com/activity/"><span role="button">Notifications</span></a>'
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    state.instagram.nukeNotifications = true
    apply(state)
    expect(isDisplayed('dashboard')).toBe(true)
    expect(isDisplayed('notifications')).toBe(true)
  })

  it('does not promote a matched action to a focusable profile header', () => {
    document.body.innerHTML = '<header id="profile" tabindex="0"><img alt="Profile"><button id="dashboard">Professional dashboard</button></header>'
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    expect(isDisplayed('dashboard')).toBe(false)
    expect(isDisplayed('profile')).toBe(true)
  })

  it('reclassifies controls when their text changes', async () => {
    document.body.innerHTML = '<header><button id="dashboard"><span>Loading</span></button></header>'
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    const text = document.querySelector('#dashboard span')!.firstChild!
    text.textContent = 'व्यावसायिक ड्यासबोर्ड'
    await vi.waitFor(() => expect(isDisplayed('dashboard')).toBe(false))
    text.textContent = 'Edit profile'
    await vi.waitFor(() => expect(isDisplayed('dashboard')).toBe(true))
  })

  it('hides a plain profile dashboard banner without hiding a sibling with multiple actions', () => {
    document.body.innerHTML = `<main><header id="profile"><a id="edit" href="/accounts/edit/">Edit</a></header>
      <div id="banner" style="display:flex!important"><div>Professional dashboard</div><p>100 accounts reached</p></div>
      <div id="actions"><a href="/professional_dashboard/">Dashboard</a><a id="saved" href="/alice/saved/">Saved</a></div></main>`
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    apply(state)
    expect(isDisplayed('banner')).toBe(false)
    for (const id of ['profile', 'edit', 'actions', 'saved']) expect(isDisplayed(id), id).toBe(true)
    state.instagram.nukeDashboard = false
    apply(state)
    expect(getComputedStyle(document.getElementById('banner')!).display).toBe('flex')
    expect(document.getElementById('banner')!.style.getPropertyPriority('display')).toBe('important')
  })

  it('reclassifies href, role, and accessible label changes', async () => {
    document.body.innerHTML = '<div><a id="dashboard" href="/accounts/edit/">Unknown language</a><div id="notifications"><svg aria-label="Loading"></svg></div></div>'
    const state = createDefaultState()
    state.instagram.nukeDashboard = true
    state.instagram.nukeNotifications = true
    apply(state)
    document.getElementById('dashboard')!.setAttribute('href', '/professional_dashboard/')
    document.getElementById('notifications')!.setAttribute('role', 'button')
    document.querySelector('#notifications svg')!.setAttribute('aria-label', 'Notificaciones')
    await vi.waitFor(() => {
      expect(isDisplayed('dashboard')).toBe(false)
      expect(isDisplayed('notifications')).toBe(false)
    })
    document.getElementById('dashboard')!.setAttribute('href', '/accounts/edit/')
    document.querySelector('#notifications svg')!.setAttribute('aria-label', 'Like')
    await vi.waitFor(() => {
      expect(isDisplayed('dashboard')).toBe(true)
      expect(isDisplayed('notifications')).toBe(true)
    })
  })

  it('uses the latest settings after notification-only mode changes to dashboard-only mode', async () => {
    document.body.innerHTML = '<header><button id="notifications">Notificaciones</button></header>'
    const first = createDefaultState()
    first.instagram.nukeNotifications = true
    apply(first)
    expect(isDisplayed('notifications')).toBe(false)
    const next = createDefaultState()
    next.instagram.nukeDashboard = true
    apply(next)
    document.querySelector('header')!.insertAdjacentHTML('beforeend', '<button id="dashboard">Panel para profesionales</button><button id="later-notifications">Notificaciones</button>')
    await vi.waitFor(() => expect(isDisplayed('dashboard')).toBe(false))
    expect(isDisplayed('notifications')).toBe(true)
    expect(isDisplayed('later-notifications')).toBe(true)
  })
})

describe('Notifications', () => {
  it('hides nested notification controls in a plain div sidebar, without hiding its other entries', () => {
    document.body.innerHTML = `<div id="sidebar"><a href="/">Home</a><a href="/reels/">Reels</a>
      <a id="notification-row" href="#"><div role="button"><svg aria-label="Notificaciones"></svg><span>3</span></div></a>
      <a id="direct" href="/direct/inbox/">Messages</a></div>`
    const state = createDefaultState()
    state.instagram.nukeNotifications = true
    apply(state)
    expect(isDisplayed('notification-row')).toBe(false)
    expect(isDisplayed('sidebar')).toBe(true)
    expect(isDisplayed('direct')).toBe(true)
  })

  it('hides a label-less heart in a plain div navigation rail, preserving non-navigation hearts', () => {
    const heart = '<svg><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122Z"></path></svg>'
    document.body.innerHTML = `<div id="rail"><a href="/">Home</a><a href="/explore/">Explore</a><div id="notifications" tabindex="0">${heart}</div></div><main><div id="other-heart" role="button">${heart}</div></main>`
    const state = createDefaultState()
    state.instagram.nukeNotifications = true
    apply(state)
    expect(isDisplayed('notifications')).toBe(false)
    expect(isDisplayed('rail')).toBe(true)
    expect(isDisplayed('other-heart')).toBe(true)
  })

  it.each(['सूचनाहरू', 'Notificaciones', 'Benachrichtigungen', 'お知らせ'])('hides a navigation control labelled %s', label => {
    document.body.innerHTML = `<nav><button id="notifications" aria-label="${label}"><svg></svg></button></nav>`
    const state = createDefaultState()
    state.instagram.nukeNotifications = true
    apply(state)
    expect(isDisplayed('notifications')).toBe(false)
    state.instagram.nukeNotifications = false
    apply(state)
    expect(isDisplayed('notifications')).toBe(true)
  })

  it('recognizes known navigation heart geometry while preserving like controls inside posts and dialogs', () => {
    const icon = '<svg><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122Z"></path></svg>'
    document.body.innerHTML = `<nav><button id="notifications">${icon}</button></nav><main><article><button id="like">${icon}</button></article><div role="dialog"><button id="dialog-like">${icon}</button></div><button id="outside">${icon}</button></main>`
    const state = createDefaultState()
    state.instagram.nukeNotifications = true
    apply(state)
    expect(isDisplayed('notifications')).toBe(false)
    for (const id of ['like', 'dialog-like', 'outside']) expect(isDisplayed(id), id).toBe(true)
  })
})
