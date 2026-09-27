import { Toggle } from './Toggle'

interface RowProps {
  label: string
  hint?: string
  checked: boolean
  disabled?: boolean
  isLast?: boolean
  activeColor?: string
  onChange: (v: boolean) => void
}

export function Row({
  label,
  hint,
  checked,
  disabled = false,
  isLast = false,
  activeColor,
  onChange,
}: RowProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
      className={[
        'row-item',
        disabled
          ? 'cursor-not-allowed disabled'
          : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="row-copy">
        <span
          className="row-label"
          style={{ color: checked && !disabled ? 'var(--text)' : 'var(--label-off)' }}
        >
          {label}
        </span>
        {hint && (
          <span className="row-hint" style={{ color: 'var(--muted)' }}>
            {hint}
          </span>
        )}
      </div>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
        <Toggle label={label} checked={checked} disabled={disabled} onChange={onChange} activeColor={activeColor} />
      </div>
    </div>
  )
}
