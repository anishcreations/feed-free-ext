import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { YouTubePanel } from './components/YouTubePanel'
import { InstagramPanel } from './components/InstagramPanel'
import { CURRENT_VERSION } from '../config/defaults'

type Site = 'youtube' | 'instagram' | 'other'
type SelectedSite = 'auto' | 'youtube' | 'instagram'

async function detectSite(): Promise<Site> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = tab?.url ?? ''
    if (url.includes('youtube.com')) return 'youtube'
    if (url.includes('instagram.com')) return 'instagram'
    return 'other'
  } catch {
    return 'other'
  }
}

export default function PopupApp() {
  const init = useStore((s) => s.init)
  const loaded = useStore((s) => s.loaded)
  const globalEnabled = useStore((s) => s.state.globalEnabled)
  const setGlobal = useStore((s) => s.setGlobal)
  const resetAll = useStore((s) => s.resetAll)

  const [currentSite, setCurrentSite] = useState<Site>('other')
  const [selectedSite, setSelectedSite] = useState<SelectedSite>('auto')
  const [showBottomFade, setShowBottomFade] = useState(true)
  const [showTopFade, setShowTopFade] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isResetting, setIsResetting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const closePicker = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) pickerRef.current?.removeAttribute('open')
    }
    const escapePicker = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && pickerRef.current?.open) {
        pickerRef.current.open = false
        pickerRef.current.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('pointerdown', closePicker)
    document.addEventListener('keydown', escapePicker)
    return () => {
      document.removeEventListener('pointerdown', closePicker)
      document.removeEventListener('keydown', escapePicker)
    }
  }, [])

  useEffect(() => {
    init()
    detectSite().then(setCurrentSite)
    chrome.storage.local.get('ff-theme').then((result) => {
      setTheme((result['ff-theme'] as 'dark' | 'light' | undefined) || 'dark')
    })
  }, [init])

  const handleScroll = useCallback(() => {
    const element = contentRef.current
    if (!element) return
    setShowBottomFade(element.scrollHeight - element.scrollTop - element.clientHeight > 12)
    setShowTopFade(element.scrollTop > 12)
  }, [])

  const effectiveSite = selectedSite === 'auto' ? currentSite : selectedSite
  const isSupportedSite = effectiveSite === 'youtube' || effectiveSite === 'instagram'
  const showUnsupportedMessage = selectedSite === 'auto' && currentSite === 'other'

  useEffect(() => {
    const timer = setTimeout(handleScroll, 100)
    return () => clearTimeout(timer)
  }, [effectiveSite, globalEnabled, handleScroll])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center" style={{ width: '100%', height: '480px', background: 'var(--bg)' }}>
        <div className="w-6 h-6 rounded-full animate-spin border-2 border-slate-700" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  const resetLabel = effectiveSite === 'youtube'
    ? 'Reset YouTube'
    : effectiveSite === 'instagram'
      ? 'Reset Instagram'
      : 'Reset'

  return (
    <div id="popup-root" data-theme={theme} className="popup-shell select-none">
      <header className="popup-header">
        <div className="popup-brand">
          <img src="/icons/icon128.png" alt="Feed Free" className="popup-logo" />
          <div>
            <div className="popup-wordmark">FF <span>–</span> UF</div>
            <div className="popup-name">Feed Free – Unbiased Feed</div>
          </div>
        </div>

        <div className="popup-header-controls">
          <button onClick={() => {
            const nextTheme = theme === 'dark' ? 'light' : 'dark'
            setTheme(nextTheme)
            chrome.storage.local.set({ 'ff-theme': nextTheme })
          }} className="theme-button" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {theme === 'dark' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 1 0 20.354 15.354z" />
              )}
            </svg>
          </button>
          <details ref={pickerRef} className="platform-picker">
            <summary className="platform-picker-face" aria-label={`Choose platform: ${selectedSite === 'auto' ? 'Auto detect' : selectedSite}`} title="Choose platform">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: selectedSite === 'instagram' ? 'var(--instagram)' : selectedSite === 'youtube' ? 'var(--youtube)' : 'var(--muted)' }}>
                {selectedSite === 'instagram' ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></> : selectedSite === 'youtube' ? <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" /></> : <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71m2.25 5.82a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />}
              </svg>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 6 5 5 5-5" /></svg>
            </summary>
            <div className="platform-menu" aria-label="Platform selection">
              {(['auto', 'youtube', 'instagram'] as const).map((site) => (
                <button key={site} type="button" aria-pressed={selectedSite === site} onClick={() => {
                  setSelectedSite(site)
                  if (pickerRef.current) {
                    pickerRef.current.open = false
                    pickerRef.current.querySelector('summary')?.focus()
                  }
                }}>
                  <span>{site === 'auto' ? 'Auto detect' : site === 'youtube' ? 'YouTube' : 'Instagram'}</span>
                  <span aria-hidden="true">{selectedSite === site ? '✓' : ''}</span>
                </button>
              ))}
            </div>
          </details>
        </div>
      </header>

      <section className="master-row">
        <div className="master-primary">
          <span className="master-title">Feed Free</span>
          <button className="master-control" onClick={() => setGlobal(!globalEnabled)} aria-label="Enable Feed Free" aria-pressed={globalEnabled}>
            <span className={`master-switch ${globalEnabled ? 'master-switch-on' : 'master-switch-off'}`} aria-hidden="true">
              <span className="master-switch-label">{globalEnabled ? 'ON' : 'OFF'}</span>
              <span className="master-switch-thumb" />
            </span>
          </button>
        </div>
        <button disabled={showUnsupportedMessage} className={`reset-control ${isResetting ? 'is-resetting' : ''}`} onClick={() => {
          setIsResetting(true)
          resetAll(isSupportedSite ? effectiveSite : undefined)
          setTimeout(() => setIsResetting(false), 600)
        }}>{resetLabel}</button>
      </section>

      {showUnsupportedMessage && (
        <section className="unsupported-panel animate-fade-in">
          <h3>Oops!</h3>
          <div className="unsupported-divider" />
          <p>This site isn’t supported yet.</p>
          <span>Works on</span>
          <div className="supported-sites"><b>YouTube</b><i>/</i><b>Instagram</b></div>
        </section>
      )}

      {isSupportedSite && !showUnsupportedMessage && (
        <main className="settings-panel">
          {showTopFade && <div className="settings-fade settings-fade-top" />}
          <div ref={contentRef} onScroll={handleScroll} className="settings-scroll">
            {effectiveSite === 'youtube' && <YouTubePanel />}
            {effectiveSite === 'instagram' && <InstagramPanel />}
          </div>
          {showBottomFade && (
            <>
              <div className="settings-fade settings-fade-bottom" />
              <div className="scroll-cue" aria-hidden="true">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m7 10 5 5 5-5M7 15l5 5 5-5" /></svg>
              </div>
            </>
          )}
        </main>
      )}

      <footer className="popup-footer">
        <a href="https://github.com/anisharyal09/feed-free-ext/blob/main/SUPPORT.md" target="_blank" rel="noopener noreferrer">Feedback</a>
        <a className="footer-love" href="https://anisharyal09.com.np/support?from=feed-free" target="_blank" rel="noopener noreferrer" aria-label="Support me" title="Support me <3">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001z" /></svg>
        </a>
        <a href="https://github.com/anisharyal09/feed-free-ext/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">v{CURRENT_VERSION}</a>
      </footer>
    </div>
  )
}
