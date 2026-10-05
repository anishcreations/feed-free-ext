import { useStore } from '../store'
import { Row } from './Row'
import { Toggle } from './Toggle'

export function InstagramPanel() {
  const state = useStore((s) => s.state)
  const setInstagram = useStore((s) => s.setInstagram)
  const disabled = !state.globalEnabled
  const activeColor = 'var(--instagram)'

  const redirectOn = state.instagram.nukeMainFeed || state.instagram.forceChronological
  const blockOn = state.instagram.blockDMs
  const redirectTarget = state.instagram.homeRedirectTarget || (state.instagram.forceChronological && !state.instagram.nukeMainFeed ? 'following' : blockOn ? state.instagram.conflictRedirectTarget : 'following')

  return (
    <div className="flex flex-col">
      {/* Feed & Navigation */}
      <div
        onClick={() =>
          !disabled &&
          setInstagram({
            nukeMainFeed: !redirectOn,
            forceChronological: !redirectOn && redirectTarget === 'following',
          })
        }
        style={{ borderBottom: '1px solid var(--border)' }}
        className={`row-item row-combo${disabled ? ' cursor-not-allowed disabled' : ' cursor-pointer'}`}
      >
        <div className="row-copy">
          <span
            className="row-label"
            style={{ color: redirectOn && !disabled ? 'var(--text)' : 'var(--label-off)' }}
          >
            Redirect Home
          </span>
          <span className="row-hint" style={{ color: 'var(--muted)' }}>
            {redirectOn && blockOn && redirectTarget === 'dms'
              ? 'DMs blocked; will use Profile'
              : 'Automatically redirect away from home feed'}
          </span>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 flex items-center gap-2"
        >
          {redirectOn && (
            <select
              disabled={disabled}
              value={redirectTarget}
              onChange={(event) => {
                const val = event.currentTarget.value as 'following' | 'dms' | 'profile' | 'saved'
                setInstagram({
                  nukeMainFeed: true,
                  homeRedirectTarget: val,
                  forceChronological: val === 'following',
                  conflictRedirectTarget: val === 'saved' ? 'saved' : 'profile',
                })
              }}
              aria-label="Redirect destination"
              className="inline-destination-select"
            >
              <option value="following">Following</option>
              <option value="dms" disabled={blockOn}>
                {blockOn ? 'DMs (Blocked)' : 'DMs'}
              </option>
              <option value="profile">Profile</option>
              <option value="saved">Saved</option>
            </select>
          )}
          <Toggle
            label="Redirect Home"
            checked={redirectOn}
            disabled={disabled}
            activeColor={activeColor}
            onChange={(v) =>
              setInstagram({
                nukeMainFeed: v,
                forceChronological: v && redirectTarget === 'following',
              })
            }
          />
        </div>
      </div>

      <Row
        label="Hide DMs"
        hint="Hide DM nav and redirect away from messages"
        checked={blockOn}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ blockDMs: v })}
      />

      <div className="nested-option">
        <Row
          label="Hide Floating Messages"
          hint={blockOn ? 'Included while Hide DMs is on' : 'Hide the floating button; keep sidebar messages available'}
          checked={blockOn || state.instagram.hideFloatingDMs}
          disabled={disabled || blockOn}
          activeColor={activeColor}
          onChange={(v) => setInstagram({ hideFloatingDMs: v })}
        />
      </div>

      {/* Content Hiding */}
      <Row
        label="Hide Reels"
        hint="Block Reels from navigation & redirects"
        checked={state.instagram.nukeReels}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeReels: v })}
      />
      <Row
        label="Hide Explore"
        hint="Hide the Explore button and block Explore pages"
        checked={state.instagram.nukeExplore}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeExplore: v })}
      />
      {state.instagram.nukeExplore && (
        <div className="nested-option">
          <Row
            label="Allow Search"
            hint="Keep Explore/Search available without recommended posts"
            checked={state.instagram.allowExploreSearch}
            disabled={disabled}
            activeColor={activeColor}
            onChange={(v) => setInstagram({ allowExploreSearch: v })}
          />
        </div>
      )}
      <Row
        label="Hide Stories (Home)"
        hint="Remove the stories tray from the home feed"
        checked={state.instagram.nukeStoriesEverywhere || state.instagram.nukeStoriesHome}
        disabled={disabled || state.instagram.nukeStoriesEverywhere}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeStoriesHome: v })}
      />
      <div className="nested-option">
        <Row
          label="Hide Stories Everywhere"
          hint="Remove stories tray, highlights, and story rings"
          checked={state.instagram.nukeStoriesEverywhere}
          disabled={disabled}
          activeColor={activeColor}
          onChange={(v) => {
            if (v) {
              setInstagram({ nukeStoriesEverywhere: true, nukeStoriesHome: true })
            } else {
              setInstagram({ nukeStoriesEverywhere: false })
            }
          }}
        />
      </div>

      {/* UI Tweaks */}
      <Row
        label="Hide Notes"
        hint="Hide profile note bubbles and the inbox Notes row, including music"
        checked={state.instagram.nukeNotes}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeNotes: v })}
      />
      <Row
        label="Hide Comments & Likes Count"
        hint="Hide comments, comments count, and post likes count"
        checked={state.instagram.hideComments}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ hideComments: v, hideLikes: v })}
      />
      <Row
        label="Hide Notifications"
        hint="Remove notifications tab from sidebar"
        checked={state.instagram.nukeNotifications}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeNotifications: v })}
      />
      <Row
        label="Hide Professional Dashboard"
        hint="Remove Dashboard navigation from sidebar"
        checked={state.instagram.nukeDashboard}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ nukeDashboard: v })}
      />
      <Row
        label="Square Profile Photos"
        hint="Render profile avatars as perfect squares"
        checked={state.instagram.squareProfile}
        disabled={disabled}
        activeColor={activeColor}
        onChange={(v) => setInstagram({ squareProfile: v })}
      />

      {/* Appearance Modes */}
      <Row
        label="Grayscale Mode"
        hint="Turn Instagram completely black & white (Press 'G' to toggle)"
        checked={state.instagram.grayMode}
        disabled={false}
        activeColor={activeColor}
        isLast
        onChange={(v) => setInstagram({ grayMode: v })}
      />

    </div>
  )
}
