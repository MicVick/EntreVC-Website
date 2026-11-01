import { BrandLogo } from '@/components/public/brand-logo'
import { cn } from '@/components/ui/cn'

/**
 * The club's logo at the centre of Kahn's circle, with the full club name running
 * around it. The ring turns slowly when motion is on. Brand recall for "What is
 * EntreVC?".
 */
export function LogoOrbit({ className }: { className?: string }) {
  return (
    <div className={cn('relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-[28rem]', className)}>
      <span aria-hidden="true" className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand)_38%,transparent)_0%,transparent_68%)] blur-xl" />
      <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false" className="absolute inset-0 size-full overflow-visible">
        <circle className="line-art" cx="200" cy="200" r="196" opacity="0.35" />
        <circle className="line-art line-art-thin" cx="200" cy="200" r="138" strokeDasharray="2 6" />
        <circle className="line-art line-art-thin" cx="200" cy="200" r="126" />
      </svg>
      <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false" className="orbit-text absolute inset-0 size-full overflow-visible">
        <defs>
          <path id="logo-orbit-path" d="M200,200 m-166,0 a166,166 0 1,1 332,0 a166,166 0 1,1 -332,0" />
        </defs>
        <text className="orbit-label orbit-label-lg">
          <textPath href="#logo-orbit-path" textLength="1035" lengthAdjust="spacing">
            Entrepreneurship &amp; Venture Capital Club · IIM Ahmedabad ·
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <BrandLogo size="orbit" asLink={false} />
      </div>
    </div>
  )
}
