'use client'

import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { cn } from '@/components/ui/cn'

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs(): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tabs components must be used inside <Tabs>')
  return context
}

type TabsProps = ComponentProps<'div'> & {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue ?? internalValue

  const setValue = (nextValue: string) => {
    if (controlledValue === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex rounded-full border border-border bg-surface p-1', className)}
      {...props}
    />
  )
}

type TabsTriggerProps = ComponentProps<'button'> & { value: string }

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const tabs = useTabs()
  const selected = tabs.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      {...props}
      className={cn(
        'min-h-9 rounded-full px-4 text-sm font-semibold text-fg-muted transition hover:text-fg aria-selected:bg-fg aria-selected:text-bg',
        className,
      )}
      onClick={() => tabs.setValue(value)}
    >
      {children}
    </button>
  )
}

type TabsContentProps = ComponentProps<'div'> & { value: string; children: ReactNode }

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const tabs = useTabs()
  return (
    <div
      role="tabpanel"
      hidden={tabs.value !== value}
      tabIndex={0}
      className={cn('mt-6', className)}
      {...props}
    />
  )
}
