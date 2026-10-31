import { getImageProps } from 'next/image'

import { SectionHeader } from '@/components/public/section-header'
import { cn } from '@/components/ui/cn'

/**
 * Photographs of Kahn's old campus, where most of the club's events happen. All are
 * from Wikimedia Commons under Creative Commons licences; the credit sits on each
 * photo and the details are in public/images/campus/README.md. Static files rather
 * than CMS uploads, so the section never depends on the media store.
 */

type CampusPhoto = {
  src: string
  width: number
  height: number
  alt: string
  caption: string
  credit: string
  license: string
  licenseUrl: string
  source: string
  /** Placement in the desktop mosaic (4 columns × 3 rows). */
  tile: string
}

const PHOTOS: readonly CampusPhoto[] = [
  {
    src: '/images/campus/louis-kahn-plaza.webp',
    width: 1280,
    height: 720,
    alt: 'Louis Kahn Plaza: a wide lawn framed by the brick classroom block, the Vikram Sarabhai Library and the faculty block with its great circular opening, under trees.',
    caption: 'Louis Kahn Plaza',
    credit: 'Perspectives, the Photography Club, IIMA',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Louis_Kahn_Plaza,_IIM_Ahmedabad.jpg',
    tile: 'lg:col-span-2 lg:row-span-2',
  },
  {
    src: '/images/campus/classroom-block.webp',
    width: 1000,
    height: 1505,
    alt: 'The corner of a four-storey brick block, its long side a deep grid of recessed openings.',
    caption: 'The classroom block',
    credit: 'Mahargh Shah',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Indian_Institute_of_Management_Ahmedabad,_2010-4.jpg',
    tile: 'lg:row-span-2',
  },
  {
    src: '/images/campus/old-campus-arches.webp',
    width: 1600,
    height: 1200,
    alt: 'A row of brick arches, one behind another, opening onto a sunlit courtyard.',
    caption: 'Arches of the old campus',
    credit: 'Steph C',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Indian_Institute_of_Management_Ahmedabad,_Arches.jpg',
    tile: '',
  },
  {
    src: '/images/campus/library-ramp-night.webp',
    width: 1600,
    height: 1064,
    alt: 'A brick arch under the ramp near the library, lit warm at night.',
    caption: 'Under the library ramp, at night',
    credit: 'Students of IIMA',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Arch_under_the_ramp_near_Vikram_Sarabhai_Library.JPG',
    tile: '',
  },
  {
    src: '/images/campus/lkp-library.webp',
    width: 1024,
    height: 575,
    alt: 'The Vikram Sarabhai Library seen across the lawn of Louis Kahn Plaza: a brick facade with a tall slot holding a round opening, an arched window and a terrace in front.',
    caption: 'Vikram Sarabhai Library, from the plaza',
    credit: 'Students of IIMA',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Indian_Institute_of_Management_Ahmedabad,_Louis_Kahn_Plaza.jpg',
    tile: 'lg:col-span-2',
  },
  {
    src: '/images/campus/arched-balconies.webp',
    width: 1000,
    height: 1505,
    alt: 'A brick wall with tiers of arched openings, each held by a concrete tie beam, above a paved courtyard.',
    caption: 'Arches and concrete ties',
    credit: 'Mahargh Shah',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    source: 'https://commons.wikimedia.org/wiki/File:Indian_Institute_of_Management_Ahmedabad,_2010-3.jpg',
    tile: 'lg:col-span-2',
  },
]

function Photo({ photo }: { photo: CampusPhoto }) {
  const { props } = getImageProps({
    src: photo.src,
    alt: photo.alt,
    width: photo.width,
    height: photo.height,
    sizes: '(min-width: 1024px) 45vw, 82vw',
  })
  return (
    <li
      className={cn(
        'w-[82vw] max-w-[26rem] shrink-0 snap-start sm:w-[45vw] lg:w-auto lg:max-w-none',
        photo.tile,
      )}
    >
      <figure className="group relative aspect-[4/5] h-full overflow-hidden rounded-xl bg-surface-2 lg:aspect-auto">
        {/* Plain <img> with next/image's optimised src/srcset, without the client runtime. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...props} alt={photo.alt} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <span className="display-type block text-lg text-white sm:text-xl">{photo.caption}</span>
          <span className="mt-1 block text-[0.7rem] leading-5 text-white/75">
            Photo:{' '}
            <a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline decoration-white/40 underline-offset-2 hover:text-white">
              {photo.credit}
            </a>
            ,{' '}
            <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline decoration-white/40 underline-offset-2 hover:text-white">
              {photo.license}
            </a>
          </span>
        </figcaption>
      </figure>
    </li>
  )
}

export function CampusGallery() {
  return (
    <section aria-labelledby="campus-title" className="section-shell isolate">
      <div className="site-shell">
        <SectionHeader
          id="campus-title"
          eyebrow="Where it happens"
          title="Brick, concrete and"
          accent="big ideas"
          description="Louis Kahn’s old campus at IIM Ahmedabad: the plaza, the library and the classrooms where much of the club’s year happens."
        />
      </div>
      <div className="site-shell">
        {/* A swipeable strip on phones and tablets, a mosaic on desktop. */}
        <ul
          aria-label="Photographs of the IIM Ahmedabad old campus"
          className="-mx-[var(--page-gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--page-gutter)] pb-3 [scroll-padding-inline:var(--page-gutter)] lg:mx-0 lg:grid lg:auto-rows-[13.5rem] lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {PHOTOS.map((photo) => (
            <Photo key={photo.src} photo={photo} />
          ))}
        </ul>
      </div>
    </section>
  )
}
