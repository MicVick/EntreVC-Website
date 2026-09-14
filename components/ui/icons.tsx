import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>
}

export function ArrowUpRightIcon(props: IconProps) {
  return <Icon {...props}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></Icon>
}

export function CheckIcon(props: IconProps) {
  return <Icon {...props}><path d="m4 12 5 5L20 6" /></Icon>
}

export function MenuIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></Icon>
}

export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 7v5h-5" />
      <path d="M4 17v-5h5" />
      <path d="M6.1 9a7 7 0 0 1 11.5-2.6L20 9" />
      <path d="m4 15 2.4 2.6A7 7 0 0 0 17.9 15" />
    </Icon>
  )
}

export function TriangleAlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10.3 3.8 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icon>
  )
}

export function XIcon(props: IconProps) {
  return <Icon {...props}><path d="m6 6 12 12" /><path d="M18 6 6 18" /></Icon>
}
