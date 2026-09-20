import { useStore } from '../store'
import { Row } from './Row'
import { MIN_BLUR_LEVEL, MAX_BLUR_LEVEL, normalizeBlurLevel } from '../../config/thumbnailBlur'

export function YouTubePanel() {
  const state = useStore((s) => s.state)
  const setYouTube = useStore((s) => s.setYouTube)
  const disabled = !state.globalEnabled
  const activeColor = 'var(--youtube)'
  const blurLevel = normalizeBlurLevel(state.youtube.thumbnailBlurLevel)

  return (
    <div className="flex flex-col">
      <Row
        label="Hide Home Feed"
        hint="Remove recommendations on homepage"
        checked={state.youtube.nukeHomeFeed}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeHomeFeed: v })}
      />
      <Row
        label="Hide Shorts"
        hint="Remove Shorts from sidebar, homepage, and channel pages"
        checked={state.youtube.nukeShorts && state.youtube.nukeShortsFromProfiles}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => {
          if (v) {
            setYouTube({ nukeShorts: v, nukeShortsFromProfiles: v })
          } else {
            setYouTube({ nukeShorts: v, nukeShortsFromProfiles: v, nukeSearchShorts: false })
          }
        }}
      />
      <div style={{ paddingLeft: '16px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
        <Row
          label="Hide Search Shorts"
          hint="Remove Shorts shelves and cards from search results"
          checked={state.youtube.nukeSearchShorts}
          disabled={disabled || !state.youtube.nukeShorts}
          activeColor={activeColor}
          onChange={(v) => setYouTube({ nukeSearchShorts: v })}
        />
      </div>
      <Row
        label="Hide Recommendations"
        hint="Clear suggestions next to videos & playlists"
        checked={state.youtube.nukeSidebarRecs}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeSidebarRecs: v })}
      />
      <Row
        label="Clean Player"
        hint="Centered, rounded player with breathing room. Removes the watch sidebar."
        checked={state.youtube.centerPlayer}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ centerPlayer: v })}
      />
      <div style={{ paddingLeft: '16px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
        <Row
          label="Keep Playlist Below Player"
          hint="Keep the current playlist accessible in Clean Player"
          checked={state.youtube.keepPlaylist}
          disabled={disabled || !state.youtube.centerPlayer}
          activeColor={activeColor}
          onChange={(v) => setYouTube({ keepPlaylist: v })}
        />
      </div>
      <Row
        label="Blur Thumbnails"
        hint="Blur video previews while keeping titles and playback clear"
        checked={state.youtube.blurThumbnails}
        isLast={state.youtube.blurThumbnails}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ blurThumbnails: v })}
      />
      {state.youtube.blurThumbnails && (
        <div className="px-[10px] pb-3" style={{ borderBottom: '1px solid var(--border)', opacity: disabled ? 0.3 : 1 }}>
          <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: 'var(--muted)' }}>
            <label htmlFor="thumbnail-blur-level">Blur strength</label>
            <output htmlFor="thumbnail-blur-level" className="tabular-nums">{blurLevel} px</output>
          </div>
          <input
            id="thumbnail-blur-level"
            type="range"
            min={MIN_BLUR_LEVEL}
            max={MAX_BLUR_LEVEL}
            step={1}
            value={blurLevel}
            aria-valuetext={`${blurLevel} pixels`}
            disabled={disabled}
            className="w-full h-4 block cursor-pointer disabled:cursor-not-allowed"
            style={{ accentColor: activeColor }}
            onChange={(e) => setYouTube({ thumbnailBlurLevel: Number(e.currentTarget.value) })}
          />
        </div>
      )}
      <Row
        label="Hide Comments"
        hint="Remove the comments section"
        checked={state.youtube.nukeComments}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeComments: v })}
      />
      <Row
        label="Hide End Screens"
        hint="Remove video card overlays at the end"
        checked={state.youtube.nukeEndScreens}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeEndScreens: v })}
      />
      <Row
        label="Hide Subscriptions"
        hint="Remove Subscriptions link from sidebar"
        checked={state.youtube.nukeSubscriptions}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeSubscriptions: v })}
      />
      <Row
        label="Hide Explore"
        hint="Remove Trending link from sidebar"
        checked={state.youtube.nukeExplore}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeExplore: v })}
      />

      <Row
        label="Hide Report History"
        hint="Remove Report History link from sidebar"
        checked={state.youtube.nukeReportHistory}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeReportHistory: v })}
      />
      <Row
        label="Hide Notifications"
        hint="Remove Notifications entry without leaving sidebar gaps"
        checked={state.youtube.nukeNotifications}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeNotifications: v })}
      />
      <Row
        label="Hide More from YouTube"
        hint="Remove 'More from YouTube' section from sidebar"
        checked={state.youtube.nukeMoreFromYouTube}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ nukeMoreFromYouTube: v })}
      />
      <Row
        label="Audio Only Mode"
        hint="Black out video, keep audio playing (Press 'A' on page to toggle)"
        checked={state.youtube.musicOnlyMode}
        disabled={false}
        activeColor={activeColor}
        onChange={(v) => setYouTube({ musicOnlyMode: v })}
      />
      {state.youtube.musicOnlyMode && (
        <div style={{ paddingLeft: '16px', borderLeft: '2px solid var(--border)', marginLeft: '10px' }}>
          <Row
            label="Show Audio Only Overlay"
            hint="Display visualizer & controls on black screen"
            checked={state.youtube.musicOnlyShowOverlay}
            disabled={false}
            activeColor={activeColor}
            onChange={(v) => setYouTube({ musicOnlyShowOverlay: v })}
          />
        </div>
      )}
      <Row
        label="Grayscale Mode"
        hint="Turn YouTube completely black & white (Press 'G' to toggle)"
        checked={state.youtube.grayMode}
        disabled={false}
        activeColor={activeColor}
        isLast
        onChange={(v) => setYouTube({ grayMode: v })}
      />
      <div style={{ height: '24px' }} />
    </div>
  )
}
