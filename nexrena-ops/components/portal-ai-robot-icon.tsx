'use client'

type Props = {
  className?: string
  animated?: boolean
}

export function PortalAiRobotIcon({ className = 'w-7 h-7', animated = true }: Props) {
  return (
    <svg
      className={`${className} ${animated ? 'portal-ai-robot' : ''}`}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="portalRobotGold" x1="8" y1="6" x2="40" y2="42">
          <stop offset="0%" stopColor="#E8D5B0" />
          <stop offset="100%" stopColor="#C9A96E" />
        </linearGradient>
        <linearGradient id="portalRobotFace" x1="12" y1="14" x2="36" y2="38">
          <stop offset="0%" stopColor="#1E2530" />
          <stop offset="100%" stopColor="#141820" />
        </linearGradient>
        <filter id="portalRobotGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Antenna */}
      <line
        x1="24"
        y1="6"
        x2="24"
        y2="12"
        stroke="url(#portalRobotGold)"
        strokeWidth="2"
        strokeLinecap="round"
        className={animated ? 'portal-ai-antenna' : undefined}
      />
      <circle cx="24" cy="5" r="2.5" fill="#E8D5B0" className={animated ? 'portal-ai-antenna-tip' : undefined} />

      {/* Head */}
      <rect
        x="10"
        y="12"
        width="28"
        height="22"
        rx="8"
        fill="url(#portalRobotFace)"
        stroke="url(#portalRobotGold)"
        strokeWidth="1.5"
      />

      {/* Eyes */}
      <circle cx="18" cy="22" r="3" fill="#0C0F12" stroke="#C9A96E" strokeWidth="1" />
      <circle cx="30" cy="22" r="3" fill="#0C0F12" stroke="#C9A96E" strokeWidth="1" />
      <circle
        cx="18"
        cy="22"
        r="1.4"
        fill="#E8D5B0"
        filter="url(#portalRobotGlow)"
        className={animated ? 'portal-ai-eye-left' : undefined}
      />
      <circle
        cx="30"
        cy="22"
        r="1.4"
        fill="#E8D5B0"
        filter="url(#portalRobotGlow)"
        className={animated ? 'portal-ai-eye-right' : undefined}
      />

      {/* Mouth panel */}
      <rect x="17" y="28" width="14" height="3" rx="1.5" fill="#2C3444" stroke="#9B7D4E" strokeWidth="0.75" />
      <line x1="19" y1="29.5" x2="21" y2="29.5" stroke="#C9A96E" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="23" y1="29.5" x2="25" y2="29.5" stroke="#C9A96E" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="27" y1="29.5" x2="29" y2="29.5" stroke="#C9A96E" strokeWidth="0.8" strokeLinecap="round" />

      {/* Body */}
      <rect
        x="14"
        y="36"
        width="20"
        height="10"
        rx="4"
        fill="#141820"
        stroke="url(#portalRobotGold)"
        strokeWidth="1.25"
      />
      <circle cx="24" cy="41" r="2" fill="#C9A96E" opacity="0.6" className={animated ? 'portal-ai-core' : undefined} />
    </svg>
  )
}
