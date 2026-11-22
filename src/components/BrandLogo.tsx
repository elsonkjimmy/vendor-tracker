interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const dims =
    size === 'sm'
      ? 'h-8 w-8 rounded-lg'
      : size === 'lg'
        ? 'h-12 w-12 rounded-2xl'
        : 'h-10 w-10 rounded-xl'

  return (
    <img
      src="/favicon.svg"
      alt="VendorTracker"
      className={`${dims} shrink-0 object-cover shadow-md shadow-slate-950/15 ring-1 ring-white/10 ${className}`}
    />
  )
}
