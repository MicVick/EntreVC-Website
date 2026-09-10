import { cn } from '@/components/ui/cn'

type StatBlockProps = {
  value: number | string
  label: string
  suffix?: string
  className?: string
}

export function StatBlock({ value, label, suffix, className }: StatBlockProps) {
  return (
    <div className={cn('border-l border-border pl-5 sm:pl-7', className)}>
      <p className="display-type text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
        {value}
        {suffix ? <span className="text-brand">{suffix}</span> : null}
      </p>
      <p className="mt-3 max-w-44 text-xs font-bold uppercase leading-5 tracking-[0.13em] text-fg-muted">{label}</p>
    </div>
  )
}
