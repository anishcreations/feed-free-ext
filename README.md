# Feed Free - Unbiased Feed Extension (FF – UF)

Take control of your social media feeds. Block algorithmic recommendations, Shorts, Reels, suggested content, comments, and more on YouTube and Instagram. Works seamlessly with SPA navigation — no page reload required.


### Get it on:
<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/feed-free-uf/">
    <img src="https://img.shields.io/badge/FIREFOX%20ADD--ON-v1.6.1-FF7139?style=flat&logo=firefoxbrowser&logoColor=white" alt="Firefox Add-on" height="23.67" />
  </a>
  &nbsp;&nbsp;
  <a href="https://chromewebstore.google.com/detail/feed-free-unbiased-feed-f/fmmfdjmmjmkedafmhhdmoafbioakeefp">
    <img src="https://img.shields.io/badge/CHROME%20WEB%20STORE-v1.4.1-4285F4?style=flat&logo=googlechrome&logoColor=white" alt="Chrome Web Store" height="23.67" />
  </a>
</p>

<p align="center">
  <img src="assets/youtube.png" alt="YouTube Feed Free" width="36%" />
  &nbsp;
  <img src="assets/instagram.png" alt="Instagram Feed Free" width="36%" />
  <br>
  <em>Current popup: YouTube in dark mode and Instagram in light mode, with enabled example settings and Profile selected as the Instagram redirect destination.</em>
</p>

<p align="center">
  <img src="assets/oops.png" alt="Unsupported Site" width="36%" />
  <br>
  <em>On unsupported sites, the popup shows where Feed Free works. Use the platform picker to manage YouTube or Instagram settings manually.</em>
</p>

---
> [!NOTE]
> See [CHANGELOG.md](CHANGELOG.md) for detailed version updates and release logs.

Screenshots show the current UI with example settings, not installation defaults. Store badges describe the published versions.

## Features

### YouTube
- **Hide Home Feed** — Remove the algorithmic video grid from youtube.com.
- **Hide Shorts** — Remove Shorts from homepage, sidebar, and channel profile pages.
- **Hide Search Shorts** — Remove Shorts shelves and video results completely from search pages, with a smart auto-dismissing toast at the top-center of the page notifying you when results are hidden.
- **Hide Recommendations** — Clear suggested recommendations next to/below the player and playlist pages (leaves playlists visible).
- **Clean Player** — Replace the watch sidebar with a centered player, capped at 1120px and sized to the available height, with responsive side margins and rounded corners. Works in narrow desktop windows; theater, fullscreen, and miniplayer retain native sizing.
- **Keep Playlist Below Player** — Child option under Clean Player to keep the current playlist beneath the video. Turn it off for a single-player view. Existing Hide Entire Sidebar preferences migrate with playlists hidden.
- **Blur Thumbnails** — Blur video thumbnails and preview media without blurring titles, avatars, or the playing video. Off by default. When enabled, a slider beneath the toggle adjusts blur strength from 1–24px and remembers your choice.
- **Hide Comments** — Remove the entire comments section.
- **Hide End Screens** — Remove video card overlays at the end of videos.
- **Hide Subscriptions** — Remove Subscriptions link from guide/sidebar.
- **Hide Explore** — Remove Trending/Explore links from guide/sidebar.
- **Hide Report History** — Remove Report History link from guide/sidebar.
- **Hide Notifications** — Remove the notifications bell and activity links from the top bar and sidebar.
- **Hide More from YouTube** — Remove the "More from YouTube" category block from the guide/sidebar.
- **Audio Only Mode** — Black out the video player (keep audio playing) with a **draggable** floating toggle button on the player UI to switch back-and-forth directly, an optional screen visual overlay, independent execution from the master switch, and keyboard shortcut (`'A'`) with floating toast notification.
- **Grayscale Mode ('G')** — Turn YouTube completely black & white with keyboard shortcut (`'G'`), floating toast notification, and independent execution from the master switch.

### Instagram
- **Following Feed** — Auto-redirect to the Following timeline instead of the algorithmic Home feed.
- **Redirect to DMs** — Go straight to `/direct/inbox/` on open instead of the feed.
- **Hide DMs** — Remove DM navigation (header/sidebar Message buttons, floating bottom-right Messages pill, unread count badges) and redirect away from the messages inbox.
- **Redirect Destination** — Choose Profile or Saved from the dropdown when both "Redirect to DMs" and "Hide DMs" are enabled.
- **Hide Reels** — Remove Reels from sidebar/navigation menus (keeping profile reels visible) and auto-redirect away from `/reels/`.
- **Hide Explore** — Remove the Explore tab and auto-redirect.
- **Hide Professional Dashboard** — Remove Professional Dashboard link and icon from the sidebar navigation on creator/business profiles.
- **Hide Stories (Home)** — Remove the top stories tray from the home feed.
- **Hide Stories Everywhere** — Completely remove the stories tray, highlights, and story rings (plus auto-redirect from `/stories/`).
- **Square Profile Photos** — Render profile pictures and story rings as soft squares.
- **Hide Notes** — Block status note bubbles from profiles and inbox.
- **Hide Comments & Likes Count** — Hide comment sections, comments count, and post likes count (while keeping the interactive Like, Comment, Share, and Save button icons visible).
- **Hide Notifications** — Remove notifications tab from sidebar, hide floating notification tooltips (Like/Comment/Follow popups), and strip unread badges.
- **Grayscale Mode ('G')** — Turn Instagram completely black & white with keyboard shortcut (`'G'`), floating toast notification, and independent execution from the master switch.

### Global
- **Master toggle** — Turn feed blocking on or off.
- **Reset** — Restore defaults for the detected or manually selected platform.
- **Independent Appearance Modes** — Audio Only Mode & Grayscale Mode run independently of master toggle so you can stay in dark/black-and-white mode anytime via shortcuts `'A'` and `'G'`.
- **Platform Selection** — Detect the current site automatically or select YouTube or Instagram manually.
- **Light/Dark Theme** — Switch themes using the header button.
- **Real-time sync** — Changes apply across all open tabs instantly.
- **SPA-proof** — Works through client-side navigation without requiring a page reload.
- **Firefox + Chrome** — Supports both browsers from the same codebase.
- **Reduced Feed Flashes** — Early page styling helps hide blocked content while the extension starts.

---

## Installation

Install using the Firefox or Chrome store badges above. To build and load the extension locally, see [Build and Load Locally](TECHNICAL.md#build-and-load-locally).

## Technical Documentation

See [TECHNICAL.md](TECHNICAL.md) for development commands, the full source structure, architecture, settings synchronization, testing, and version metadata.

---

## Troubleshooting

> [!IMPORTANT]
> **Extension Not Working?**  
> For any issue with the extension not working or functioning correctly:
>
>**Force reload** the webpage (YouTube/Instagram). If it still doesn't work after this, kindly report the issue.

---

## Support & Feedback

If you encounter bugs, have feature suggestions, or want to share feedback:
> **Email**: Contact us at [email address](mailto:anish.creations.hq@gmail.com?subject=[Feed%20Free%20Extension]%20Support%20/%20Feedback). Please keep the prefilled subject line intact.
>
> **Site**: You can also contact me directly via [anisharyal09.com.np](https://anisharyal09.com.np/#contact) (for any support, features or bugs)


---

## Roadmap

### Phase 2 — The Unified Unbiased Engine *(Core Feature)*
The main upcoming feature is a shared data engine that feeds unmanipulated, randomly discovered, or educational content to both platforms, creating a custom Unbiased Feed!
- **YouTube Injection**: Pull unbiased random videos/shorts into a custom or home feed.
- **Instagram Side-Injection**: Inject insta reels randomly if possible by any means (or cross-platform random YouTube Shorts) directly into the Instagram interface, else any other platform resources (like wikipedia random content).
- **Architecture Designed for Expansion**: The engine's data pipeline will feed into any supported platform beyond YouTube and Instagram.

### Phase 3 — The Lock *(Behavioral Control)*
Add intentional friction to your social media usage for a true digital detox.

> *Note: These are just a basic theoretical outline. Features may be reimagined or changed entirely as development continues. (Open to new ideas and suggestions!)*

## Privacy

Feed Free - Unbiased Feed (FF-UF) is built with privacy in mind. It operates entirely locally in your browser and does not collect, store, or transmit any user data. See the detailed [PRIVACY.md](PRIVACY.md) policy for more information.

---

## License

Apache 2.0
