const SmileIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <line x1="9" y1="10" x2="9" y2="10" strokeWidth="2.5"/>
    <line x1="15" y1="10" x2="15" y2="10" strokeWidth="2.5"/>
    <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/>
  </svg>
)

const FrownIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <line x1="9" y1="10" x2="9" y2="10" strokeWidth="2.5"/>
    <line x1="15" y1="10" x2="15" y2="10" strokeWidth="2.5"/>
    <path d="M8.5 16.5a4.5 4.5 0 0 1 7 0"/>
  </svg>
)

const DashIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <line x1="9" y1="10" x2="9" y2="10" strokeWidth="2.5"/>
    <line x1="15" y1="10" x2="15" y2="10" strokeWidth="2.5"/>
    <line x1="8.5" y1="15.5" x2="15.5" y2="15.5"/>
  </svg>
)

const MOOD_CONFIG = {
  good: {
    label: 'Good',
    Icon: SmileIcon,
    faceBg: '#dce8dc',
    faceBgSel: '#3f7d58',
    iconStroke: '#3f7d58',
    iconStrokeSel: 'white',
    outline: '0 0 0 2px #3f7d58, 0 8px 20px -10px rgba(63,125,88,.3)',
    labelColorSel: '#3f7d58',
  },
  bad: {
    label: 'Bad',
    Icon: FrownIcon,
    faceBg: '#f1dcdb',
    faceBgSel: '#b94a4a',
    iconStroke: '#b94a4a',
    iconStrokeSel: 'white',
    outline: '0 0 0 2px #b94a4a, 0 8px 20px -10px rgba(185,74,74,.3)',
    labelColorSel: '#b94a4a',
  },
  off: {
    label: 'Off',
    Icon: DashIcon,
    faceBg: '#ece3cb',
    faceBgSel: '#c9b892',
    iconStroke: '#8a7a55',
    iconStrokeSel: 'white',
    outline: '0 0 0 2px #c9b892, 0 8px 20px -10px rgba(201,184,146,.3)',
    labelColorSel: '#8a7a55',
  },
}

export default function MoodButton({ mood, selected, disabled, onClick }) {
  const cfg = MOOD_CONFIG[mood]
  const { Icon } = cfg

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        boxShadow: selected ? cfg.outline : '0 0 0 1px #e2d8c5',
        transform: selected ? 'translateY(-2px)' : 'none',
        background: selected ? cfg.faceBg : '#fffaf2',
        transition: 'all .15s',
      }}
      className={[
        'flex-1 flex flex-col items-center gap-2.5 rounded-[20px] pt-[22px] pb-4 px-3',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
        style={{
          background: selected ? cfg.faceBgSel : cfg.faceBg,
          stroke: selected ? cfg.iconStrokeSel : cfg.iconStroke,
        }}
      >
        <Icon />
      </span>
      <span
        className="font-sans text-[13px] tracking-[0.01em]"
        style={{
          color: selected ? cfg.labelColorSel : '#5a4f41',
          fontWeight: selected ? 600 : 500,
        }}
      >
        {cfg.label}
      </span>
    </button>
  )
}
