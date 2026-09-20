import Image from 'next/image'

export function InstituteMark() {
  return (
    <a href="https://www.iima.ac.in/" target="_blank" rel="noreferrer" aria-label="IIM Ahmedabad website" className="flex shrink-0 items-center border-l border-border pl-4 transition hover:opacity-75">
      <Image src="/brand/iima-logo.svg" alt="IIM Ahmedabad" width={48} height={48} className="size-10 sm:size-12" />
    </a>
  )
}
