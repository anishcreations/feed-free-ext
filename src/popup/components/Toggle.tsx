interface ToggleProps {
  label?: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
  activeColor?: string
}

export function Toggle({ label, checked, disabled = false, onChange, activeColor }: ToggleProps) {
  const bg = checked ? (activeColor || 'var(--accent)') : 'var(--border)'
  
  return (
    <button
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{ backgroundColor: bg }}
      className={[
        'relative shrink-0 w-[30px] h-[16px] rounded-full transition-all duration-200 ease-in-out',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110 active:scale-95',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-[2px] left-[2px] w-[12px] h-[12px] rounded-full bg-white transition-all duration-200 ease-in-out shadow-[0_1px_2px_rgba(0,0,0,0.24)]',
          checked ? 'translate-x-[14px]' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}
