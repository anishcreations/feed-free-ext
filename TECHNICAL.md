# Technical Guide

Development setup, project structure, and implementation details for Feed Free. For features, store links, and support, see [README.md](README.md).

## Build and Load Locally

### Chrome / Chromium
```bash
npm install
npm run build:chrome
```
Load `dist/chrome/` as an unpacked extension at `chrome://extensions` (enable Developer mode first).

### Firefox
```bash
npm install
npm run build:firefox
```
Load `dist/firefox/manifest.json` via `about:debugging` → This Firefox → Load Temporary Add-on.

After rebuilding, reload the installed extension and refresh open supported tabs so they use the updated content scripts.

---

The build writes browser-specific output to `dist/chrome` or `dist/firefox`. Chrome uses a background service worker; the Firefox build replaces it with a background script entry. Both manifests use MV3.

## Development

```bash
npm run dev               # Chrome dev server with HMR (load dist/chrome/)
npm run dev:firefox       # Firefox dev server (load dist/firefox/manifest.json)
npm run dev:reload        # Chrome watch build (manual reload)
npm run build            # Build both Chrome + Firefox
npm run typecheck         # TypeScript check
npx playwright install chromium # One-time browser setup after npm ci
npm test                  # Unit/DOM tests followed by Chromium fixture tests
npm run test:unit         # Vitest only (no browser geometry checks)
npm run test:browser      # Chromium fixture tests only
npm run test:watch        # Re-run unit/DOM tests during development
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Chrome MV3 / Firefox MV3 |
| Bundler | Vite 6 + CRXJS Vite Plugin |
| UI | React 19 + Zustand 5 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5 |

---

## Project Structure

```
src/
├── background/
│   └── index.ts            # Background entry (storage initialization)
├── bootstrap/
│   └── antiflicker.ts      # document_start anti-flicker script
├── config/
│   ├── defaults.ts         # Default state values & version configs
│   ├── selectors.ts        # CSS element-blocking selectors
│   └── thumbnailBlur.ts    # Blur-strength limits and normalization
├── content/
│   ├── shared/
│   │   ├── injector.ts     # Style element injector helper
│   │   └── patron.ts       # Detect URL changes following DOM mutations
│   ├── youtube/
│   │   ├── index.ts        # YouTube content script main logic
│   │   ├── rules.ts        # YouTube-specific CSS selectors/rules
│   │   └── layout.ts       # Clean Player layout rules
│   └── instagram/
│       ├── index.ts        # Instagram content script main logic
│       ├── rules.ts        # Instagram-specific CSS selectors/rules
│       ├── explore.ts      # Explore route classification
│       ├── redirect.ts     # Login detection and redirect handling
│       ├── floating-dms.ts # Floating Messages launcher detection
│       └── nav-items.ts    # Dashboard/notification control detection and restoration
├── popup/
│   ├── components/
│   │   ├── InstagramPanel.tsx # Instagram toggle panel
│   │   ├── YouTubePanel.tsx   # YouTube toggle panel
│   │   ├── Row.tsx            # Standard setting toggle row component
│   │   └── Toggle.tsx         # Reusable toggle switch UI component
│   ├── PopupApp.tsx        # Main Popup React application
│   ├── index.html          # Popup HTML entry point
│   ├── index.tsx           # Popup React mounting logic
│   ├── popup.css           # Styling for the Popup UI
│   ├── store.ts            # Zustand store for state sync
│   ├── site.ts             # Popup platform detection
│   └── scroll.ts           # Observe viewport and settings content size
├── types/
│   └── index.ts            # TypeScript type definitions
└── utils/
    └── storage.ts          # chrome.storage.local wrapper & listeners

tests/                      # Unit/DOM tests, browser fixtures, and API test adapters
vitest.config.ts            # Unit/DOM test runner
playwright.config.ts        # Headless browser fixture runner
manifest.json               # Chrome manifest (MV3)
vite.config.ts              # Vite build config (dynamically builds Firefox manifest)
```

---

## How It Works

### Selectors and CSS Injection

Platform rules live in `src/config/selectors.ts` and the platform-specific `rules.ts` files. They use structural selectors, attributes, ARIA labels, and some platform class names, with fallbacks where provided. YouTube and Instagram layout changes can require selector updates.

The shared injector applies rules through a `<style>` element on `document.documentElement`. Content scripts also handle redirects and behavior that requires JavaScript, such as player controls and some comment-hiding rules.

Instagram’s `nav-items.ts` detects dashboard and notification controls through app routes and exact normalized labels. Fragment-only links such as Afrikaans’s `Professionele beheerpaneel` use label matching. Unlabelled heart icons require a recognized navigation container or a nearby group of app links, so post like buttons remain available. Dashboard route classification is also used by redirects.

Hide Notes retains the existing profile bubble rules and adds an inbox carousel rule only on `/direct` routes. It targets the surrounding row through the supplied virtualized-list structure, avatar controls, and note-bubble wrapper, hiding music tiles and carousel arrows together. CSS handles inserted rows automatically; disabling the feature or master switch, or leaving DMs, removes the extra rule. This selector still depends on Instagram’s markup and note-bubble classes.

One observer batches relevant DOM changes into an animation-frame scan using current settings. The module marks individual controls and tracks their inline display values and priorities. Disabling a feature, reclassifying a control, or removing it from the DOM restores its display style. The observer ignores the module’s own marker/style attributes to avoid triggering itself.

### State Management

Defaults and the settings version are defined in `src/config/defaults.ts`. `src/utils/storage.ts` loads settings from `chrome.storage.local`, applies migrations, merges missing defaults, and saves normalized state when it differs from storage.

Settings reach supported tabs through three paths:

1. **Messages:** The popup broadcasts changes through `chrome.tabs.sendMessage`.
2. **Storage events:** `chrome.storage.onChanged` listeners receive updates.
3. **Polling:** Content scripts check stored settings every two seconds as a fallback.

The popup uses Zustand. Its initialization returns a listener cleanup function and ignores asynchronous initialization results after cleanup. Reset preserves the other platform's settings when a platform is specified.

### Popup Layout and Controls

`PopupApp.tsx` manages theme, platform selection, the master toggle, and reset. Platform detection parses the tab URL and checks the supported hostnames. Manual selection overrides auto-detection.

Setting rows use a grid with a fixed switch column. Shared styles live in `popup.css`; Tailwind supplies utility styles. Scroll indicators observe both viewport and content sizes, so conditional controls can change height without leaving a stale indicator. The observer disconnects when the panel changes or unmounts.

### SPA Navigation Detection

`DOMPatron` observes DOM mutations and checks whether `location.href` changed before running the navigation callback. This avoids treating the extension's own style changes as navigation. Detection depends on a DOM mutation occurring; it is not a guarantee of immediate filtering.

### Anti-Flicker

The bootstrap content script starts at `document_start`, loads saved settings asynchronously, and injects early CSS when feed blocking is enabled. This reduces flashes while the main content script starts. The main script removes the bootstrap style when taking over. Storage loading is asynchronous, so hiding before the first render is not guaranteed.

### Heartbeat Recovery

Each platform content script runs a 2.5-second interval to reapply rules and maintain platform-specific behavior. This helps recover when the page changes or replaces styled elements.

## Validation

The test dependencies require Node 22.22.2+ within the 22.x line, 24.15+ within 24.x, or Node 26+.

Run `npm run typecheck`, `npm test`, and `npm run build` before submitting code changes. Install the Chromium test browser once with `npx playwright install chromium` (`--with-deps` on Linux CI). `npm test` fails if either suite fails; browser checks are not silently skipped.

- **Unit/DOM tests (`test:unit`)**: rule and route selection, settings/storage behavior, mounted Instagram popup interactions, stylesheet injection, DOM observers, and redirect handling with mocked navigation. Navigation-control tests cover translations, fragment links, sibling preservation, dynamic updates, and display restoration. Notes checks cover DM route boundaries, whole-row hiding/restoration, and preservation of unrelated lists.
- **Browser tests (`test:browser`)**: execute the YouTube/Instagram layout fixtures in headless Chromium and check rendered home/search visibility, floating Messages controls, dashboard/notification hiding and restoration, DM Notes row removal including music and arrows, and native ResizeObserver behavior. Notes checks also verify that chats move up, messaging remains usable, and inserted rows hide automatically. The dedicated Vite server does not build or alter `dist`.

The Chrome API test adapter copies stored values and emits events, but remains a mock. These tests do not verify real extension storage quotas, browser messaging delivery, or installation. Browser fixtures use synthetic markup, not live Instagram/YouTube pages; they cannot establish current site selector compatibility or actual network/infinite-scroll behavior. Coverage is focused, not exhaustive across every feature.

Automated tests do not replace checking the popup in both themes or verifying behavior on live YouTube and Instagram pages. For popup changes, check manual and automatic platform selection, master on/off, platform-specific reset, nested controls, and scrolling.

## Version Metadata

Keep `package.json`, the root package entries in `package-lock.json`, `manifest.json`, and `CURRENT_VERSION` in `src/config/defaults.ts` consistent. Do not change dependency versions when updating the extension version.

Record version history in [CHANGELOG.md](CHANGELOG.md). Annotated `vX.Y.Z` Git tags mark source snapshots; generated `dist` directories remain ignored. README store badges represent published store versions and are updated manually after store approval, independently of the source version.
