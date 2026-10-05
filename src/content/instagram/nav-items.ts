import type { FeedFreeState } from '../../types'

const NOTIFICATION_MARKER = 'data-ff-notif-hidden'
const DASHBOARD_MARKER = 'data-ff-dashboard-hidden'
const NAVIGATION = 'nav, [role="navigation"], header'
const CONTROLS = 'a[href], button, [role="button"], [role="link"], [tabindex="0"]'
const EXCLUDED = 'article, [role="article"], [role="feed"], [role="dialog"], [role="listbox"]'
const PAGE_CONTAINERS = 'body, html, main, nav, header, #root'
const CANDIDATES = `${CONTROLS}, header section > div, main header ~ div`
const BANNER_CONTENT = `${CONTROLS}, ${EXCLUDED}, form, input, textarea, img, video`

// Label fallbacks cover supported translations for controls with no dashboard route.
const DASHBOARD_LABELS = [
  'professional dashboard', 'professional-dashboard', 'dashboard', 'insights',
  'professionele beheerpaneel',
  'व्यावसायिक ड्यासबोर्ड', 'व्यावसायिक ड्यासबोर्डहरू', 'ड्यासबोर्ड',
  'प्रोफेशनल डैशबोर्ड', 'डैशबोर्ड', 'इनसाइट्स',
  'panel para profesionales', 'panel profesional', 'estadísticas',
  'painel profissional', 'painel de controle',
  'tableau de bord', 'tableau de bord professionnel', 'statistiques',
  'dashboard per professionisti', 'profesyonel pano',
  'ダッシュボード', 'プロフェッショナルダッシュボード', 'インサイト',
  '대시보드', '프로페셔널 대시보드', '인사이트',
  '专业面板', '专业控制板', '控制板', '洞察',
  'لوحة المعلومات', 'لوحة المعلومات الاحترافية', 'الرؤى',
]
const NOTIFICATION_LABELS = [
  'notifications', 'activity', 'सूचनाहरू', 'सूचनाहरु', 'सूचनाएं', 'सूचनाएँ', 'सूचना',
  'notificaciones', 'actividad', 'benachrichtigungen', 'aktivität', 'notifiche', 'attività',
  'notificações', 'atividade', 'уведомления', 'действия', 'お知らせ', 'アクティビティ',
  '알림', '활동', '通知', '动态', 'إشعارات', 'النشاط', 'bildirimler', 'hareketler',
  'notifikasi', 'aktivitas', 'meldingen', 'activiteit', 'powiadomienia', 'aktywność',
  'aviseringar', 'aktivitet',
]
const normalize = (text: string) => text.normalize('NFKC')
  .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase()
const dashboardLabels = new Set(DASHBOARD_LABELS.map(normalize))
const notificationLabels = new Set(NOTIFICATION_LABELS.map(normalize))

let observer: MutationObserver | null = null
let frame: number | null = null
let currentState: FeedFreeState | null = null
// Retain hidden nodes only until the next scan so rerendered/detached controls
// also get their styles restored before they can be reused by the page.
const displays = new Map<HTMLElement, { value: string; priority: string }>()

export function isDashboardPath(path: string): boolean {
  return /^\/(?:accounts\/|(?!(?:p|tv|reel|reels|stories|explore|direct)\/)[^/]+\/)?(?:professional_dashboard|professional-dashboard|dashboard|insights)(?:\/|$)/i.test(path)
}

function getPath(candidate: HTMLElement): string {
  const href = candidate.getAttribute('href')
  if (!href) return ''
  try {
    const url = new URL(href, location.href)
    return url.origin === location.origin ? url.pathname : ''
  } catch {
    return ''
  }
}

function hasLabel(candidate: HTMLElement, labels: Set<string>): boolean {
  const matches = (el: Element) => labels.has(normalize(el.getAttribute('aria-label') || '')) ||
    labels.has(normalize(el.textContent || ''))
  if (matches(candidate)) return true
  for (const labelled of candidate.querySelectorAll('[aria-label], span, div, p, h1, h2, h3, h4, h5, h6')) {
    if (matches(labelled)) return true
  }
  return false
}

function hasHeart(candidate: HTMLElement): boolean {
  return Array.from(candidate.querySelectorAll('svg path')).some(path => {
    const d = path.getAttribute('d') || ''
    return d.includes('M16.792 3.904A4.989 4.989') || d.includes('M12 21.35')
  })
}

function ownsDisplay(el: HTMLElement): boolean {
  return el.style.getPropertyValue('display') === 'none' && el.style.getPropertyPriority('display') === 'important'
}

function restoreDisplay(el: HTMLElement): void {
  const saved = displays.get(el)
  if (!saved) return
  // Preserve a display value the page changed while this control was hidden.
  if (ownsDisplay(el)) {
    if (saved.value) el.style.setProperty('display', saved.value, saved.priority)
    else el.style.removeProperty('display')
  }
  displays.delete(el)
}

function reconcile(dashboards: Set<HTMLElement>, notifications: Set<HTMLElement>): void {
  const items = new Set([
    ...displays.keys(), ...dashboards, ...notifications,
    ...document.querySelectorAll<HTMLElement>(`[${DASHBOARD_MARKER}], [${NOTIFICATION_MARKER}]`),
  ])
  for (const el of items) {
    const dashboard = dashboards.has(el)
    const notification = notifications.has(el)
    el.toggleAttribute(DASHBOARD_MARKER, dashboard)
    el.toggleAttribute(NOTIFICATION_MARKER, notification)
    if (!dashboard && !notification) {
      restoreDisplay(el)
      continue
    }

    const hidden = ownsDisplay(el)
    if (!displays.has(el) || !hidden) displays.set(el, {
      value: el.style.getPropertyValue('display'), priority: el.style.getPropertyPriority('display'),
    })
    if (!hidden) el.style.setProperty('display', 'none', 'important')
  }
}

function restoreNavItems(): void {
  reconcile(new Set(), new Set())
}

// Nested role=button elements can belong to one anchor. Never hide a container
// holding separate actions, such as the entire sidebar or profile action row.
function hasSingleAction(el: HTMLElement): boolean {
  const controls = Array.from(el.querySelectorAll(CONTROLS))
  return controls.every((control, index) => index === 0 || controls[index - 1].contains(control))
}

function getActionTarget(candidate: HTMLElement): HTMLElement {
  let target = candidate
  let parent = target.parentElement?.closest<HTMLElement>(CONTROLS)
  while (parent && !parent.matches(PAGE_CONTAINERS) && !parent.closest(EXCLUDED) && hasSingleAction(parent)) {
    target = parent
    parent = target.parentElement?.closest<HTMLElement>(CONTROLS)
  }
  return target
}

function isInNavigation(candidate: HTMLElement): boolean {
  if (candidate.closest(NAVIGATION)) return true
  // Instagram can render the sidebar as ordinary divs. Identify a nearby rail
  // through distinct app destinations instead of requiring semantic nav markup.
  for (let parent = candidate.parentElement; parent; parent = parent.parentElement) {
    if (parent.id === 'root' || parent.matches('body, html, main')) break
    if (parent.querySelector(`main, ${EXCLUDED}`)) continue
    const paths = new Set(Array.from(parent.querySelectorAll<HTMLElement>('a[href]')).map(getPath)
      .filter(path => /^\/(?:$|(?:reels|explore|direct)(?:\/|$))/.test(path)))
    if (paths.size >= 2) return true
  }
  return false
}

function scanNavItems(state: FeedFreeState): void {
  const dashboards = new Set<HTMLElement>()
  const notifications = new Set<HTMLElement>()
  const controls = document.querySelectorAll<HTMLElement>(CANDIDATES)

  for (const candidate of controls) {
    if (candidate.closest(EXCLUDED) || candidate.matches(PAGE_CONTAINERS) || !hasSingleAction(candidate)) continue
    const isControl = candidate.matches(CONTROLS)
    // Plain profile banners are supported, but page content and action groups
    // must never be treated as a single dashboard control.
    if (!isControl && (candidate.querySelector(BANNER_CONTENT) || (candidate.textContent || '').length > 200)) continue

    const target = getActionTarget(candidate)
    // A nested button can belong to an external link. Its label is not an
    // Instagram action, even when it uses the same dashboard/activity wording.
    if (target.getAttribute('href') && !getPath(target)) continue
    const path = getPath(candidate)
    if (state.instagram.nukeDashboard && (isDashboardPath(path) || hasLabel(candidate, dashboardLabels))) {
      dashboards.add(target)
    }

    if (state.instagram.nukeNotifications && isControl && (
      /^\/(?:notifications|activity|accounts\/activity)(?:\/|$)/.test(path) ||
      hasLabel(candidate, notificationLabels) || (hasHeart(candidate) && isInNavigation(candidate))
    )) {
      notifications.add(target)
    }
  }
  reconcile(dashboards, notifications)
}

function scheduleScan(): void {
  if (frame !== null) return
  frame = requestAnimationFrame(() => {
    frame = null
    if (currentState) scanNavItems(currentState)
  })
}

export function syncInstagramNavItems(state: FeedFreeState): void {
  currentState = state
  const enabled = state.globalEnabled && (state.instagram.nukeNotifications || state.instagram.nukeDashboard)
  if (!enabled) {
    observer?.disconnect()
    observer = null
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    restoreNavItems()
    return
  }
  scanNavItems(state)
  if (observer) return
  observer = new MutationObserver(scheduleScan)
  observer.observe(document.documentElement, {
    childList: true, subtree: true, characterData: true, attributes: true,
    attributeFilter: ['href', 'aria-label', 'role', 'tabindex'],
  })
}
