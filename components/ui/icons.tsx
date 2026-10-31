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

// Added so server components on the homepage path avoid lucide-react, whose 1.x icons
// are client components and add JavaScript to every page that uses them. Paths follow
// lucide's (ISC licence).

export function ArrowDownIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></Icon>
}

export function ClockIcon(props: IconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Icon>
}

export function CalendarClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
      <path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h5" />
      <path d="M17.5 17.5 16 16.3V14" /><circle cx="16" cy="16" r="6" />
    </Icon>
  )
}

export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  )
}

export function MailIcon(props: IconProps) {
  return <Icon {...props}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Icon>
}

export function ExternalLinkIcon(props: IconProps) {
  return <Icon {...props}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></Icon>
}

export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </Icon>
  )
}

export function ContactIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16 2v2" /><path d="M17.915 22a6 6 0 0 0-12 0" /><path d="M8 2v2" />
      <circle cx="12" cy="12" r="4" /><rect x="3" y="4" width="18" height="18" rx="2" />
    </Icon>
  )
}

export function PlayIcon(props: IconProps) {
  return <Icon {...props}><path d="M6 3 20 12 6 21Z" /></Icon>
}
