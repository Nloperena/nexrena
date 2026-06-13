type Props = {
  size?: 'sm' | 'md' | 'lg'
  /** @deprecated Wordmark removed — kept for call-site compatibility */
  showWordmark?: boolean
  className?: string
}

const letterSizes = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
}

/** Brand mark — italic serif N */
export function NexrenaLogo({ size = 'md', className = '' }: Props) {
  return (
    <span
      className={`font-serif italic text-gold-light leading-none select-none ${letterSizes[size]} ${className}`}
      aria-label="Nexrena"
    >
      N
    </span>
  )
}
