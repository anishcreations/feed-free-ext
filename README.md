# Feed Free - Unbiased Feed Extension (FF – UF)

Take control of your social media feeds. Block algorithmic recommendations, Shorts, Reels, suggested content, comments, and more on YouTube and Instagram. Supports YouTube and Instagram navigation within the same page.


### Get it on:
<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/feed-free-uf/">
    <img src="https://img.shields.io/badge/FIREFOX%20ADD--ON-v1.6.1-FF7139?style=flat&logo=firefoxbrowser&logoColor=white" alt="Firefox Add-on" height="23.67" />
  </a>
  &nbsp;&nbsp;
  <a href="https://chromewebstore.google.com/detail/feed-free-unbiased-feed-f/fmmfdjmmjmkedafmhhdmoafbioakeefp">
    <img src="https://img.shields.io/badge/CHROME%20WEB%20STORE-v1.6.1-4285F4?style=flat&logo=googlechrome&logoColor=white" alt="Chrome Web Store" height="23.67" />
  </a>
</p>

<p align="center">
  <img src="assets/youtube.png" alt="YouTube Feed Free" width="36%" />
  &nbsp;
  <img src="assets/instagram.png" alt="Instagram Feed Free" width="36%" />
  <br>
  <em>Example popup: YouTube in dark mode and Instagram in light mode, with enabled example settings and Profile selected as the Instagram redirect destination.</em>
</p>

<p align="center">
  <img src="assets/oops.png" alt="Unsupported Site" width="36%" />
  <br>
  <em>On unsupported sites, the popup shows where Feed Free works. Use the platform picker to manage YouTube or Instagram settings manually.</em>
</p>

---
> [!NOTE]
> See [CHANGELOG.md](CHANGELOG.md) for detailed version updates and release logs.

Screenshots show example settings and may not include the latest controls. Store badges describe the published versions.

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

#### Feed and messages

- **Redirect Home** — Automatically redirect away from the algorithmic Home feed on open. Choose your preferred destination directly from the nested selector: **Following Feed** (chronological posts), **Direct Messages**, **Profile**, or **Saved**.
- **Hide DMs** — Remove DM navigation (header/sidebar Message buttons, floating bottom-right Messages pill, unread count badges) and redirect away from the messages inbox. If Redirect Home was set to Direct Messages, it automatically redirects to Profile or Saved instead.
- **Hide Floating Messages** — Hide only Instagram’s floating Messages launcher while keeping sidebar navigation and the inbox available. Hide DMs forces this nested option on; turning it off restores your previous choice.
- **Hide Reels** — Remove Reels from sidebar/navigation menus (keeping profile reels visible) and auto-redirect away from `/reels/`.
- **Hide Explore** — Remove the Explore button and redirect away from Explore pages.
- **Allow Search** — A child option under Hide Explore. Keep Explore/Search available while hiding recommendations and feed loaders. Search results, hashtag pages, and location pages stay accessible. Off by default.

#### Stories and post details

- **Hide Stories (Home)** — Remove the top stories tray from the home feed.
- **Hide Stories Everywhere** — Completely remove the stories tray, highlights, and story rings (plus auto-redirect from `/stories/`).
- **Hide Notes** — Block status note bubbles from profiles and inbox.
- **Hide Comments & Likes Count** — Hide comment sections, comments count, and post likes count (while keeping the interactive Like, Comment, Share, and Save button icons visible).

#### Appearance and navigation

- **Square Profile Photos** — Render profile pictures and story rings as soft squares.
- **Hide Professional Dashboard** — Remove Professional Dashboard link and icon from the sidebar navigation on creator/business profiles.
- **Hide Notifications** — Remove notifications tab from sidebar, hide floating notification tooltips (Like/Comment/Follow popups), and strip unread badges.
- **Grayscale Mode ('G')** — Turn Instagram completely black & white with keyboard shortcut (`'G'`), floating toast notification, and independent execution from the master switch.

### Global
- **Master toggle** — Turn feed blocking on or off.
- **Reset** — Restore defaults for the detected or manually selected platform.
- **Independent Appearance Modes** — Audio Only Mode & Grayscale Mode run independently of master toggle so you can stay in dark/black-and-white mode anytime via shortcuts `'A'` and `'G'`.
- **Platform Selection** — Detect the current site automatically or select YouTube or Instagram manually.
- **Light/Dark Theme** — Switch themes using the header button.
- **Settings sync** — Changes are sent to open supported tabs, with periodic checks to recover missed updates.
- **Page navigation** — Reapplies settings as the site navigates without a full page reload.
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

Feed controls continue to receive fixes and features throughout the roadmap. Phase numbers describe development priorities; release versions apply to the whole extension.

### Phase 2 — The Lock *(Behavioral Control)*
Add intentional friction to social media usage to help you follow the limits you choose.

### Phase 3 — The Unified Unbiased Engine *(Core Feature)*
Explore a shared engine for randomly discovered or educational content across supported platforms, creating a custom Unbiased Feed.

- **YouTube Injection**: Bring randomly discovered videos or Shorts into a custom feed.
- **Instagram Integration**: Explore random Reels or alternative sources, such as YouTube Shorts or Wikipedia, where platform access permits.
- **Expansion**: Design the pipeline to support additional platforms.

> *Note: These are just a basic theoretical outline. Features may be reimagined or changed entirely as development continues. (Open to new ideas and suggestions!)*

## Privacy

Feed Free - Unbiased Feed (FF-UF) is built with privacy in mind. It operates entirely locally in your browser and does not collect, store, or transmit any user data. See the detailed [PRIVACY.md](PRIVACY.md) policy for more information.

---

## License

Apache 2.0
