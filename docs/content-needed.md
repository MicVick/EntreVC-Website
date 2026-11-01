# Content needed before launch

The dark redesign (`site/dark-redesign`) is finished as a design. What still shows is a mix
of real facts and demo data from the seed script. Most items below are entered in the admin
at `/admin`, and none of them need code changes. Items marked **(code)** need a developer.

Tick each item off as it is done.

## 1. Brand files

- [x] **Logo.** Traced from `brand/logo/EntreVC_Logo.png` into SVG
  (`brand/logo/entrevc-*.svg`) and now used across the site. If the club has the
  original vector file from its designer, send it: the trace is very close but not exact.
- [x] **Square mark** for the browser tab: made from the red triangle (`app/icon.svg`,
  `app/favicon.ico`, `app/apple-icon.png`).
- [ ] **Link preview image**, 1200 × 630 PNG, shown when the site is shared on WhatsApp or
  LinkedIn.
- [ ] **IIMA crest.** The footer shows it in white. Please check with the institute that
  this is allowed under their brand rules.

- [ ] **Supabase Storage is paused** (HTTP 540 on upload). Restore the project in the
  Supabase dashboard, or uploads in the admin will fail. Then run `npm run seed:reset`
  once more if you want the seed images back in cloud storage.

## 2. Site Settings (admin → Site Settings)

Filled from the 2026–27 club run deck (`EntreVC_ClubRun_2026-27.pdf`) on 1 Nov 2026 with
`npm run seed:settings`, which rewrites Site settings without touching other content.

- [x] **Positioning statement**: the club's mission from the deck ("IIMA’s launchpad for
  entrepreneurship, connecting every founder to mentorship, capital and community"). It is
  the "Our mission" line on the homepage, the footer blurb and the search description.
- [x] **Homepage intro** rewritten from the deck's "Who we are" slide.
- [x] **Club story tab**: who we are (250+ members, Overall Excellence Award, IIMA
  Ventures), 2025–26 in numbers and flagships, the IIMA founder wall, and the 2026–27 road
  ahead. Refresh these at each handover.
- [x] **Club email**: `entre@iima.ac.in` everywhere, including every contact-form category,
  named contacts, listing corrections and the IIMA Ventures contact.
- [x] **Verticals** now match the deck's six cells (Partnerships, Events, Marketing &
  Design, Startups, Career, Finance & Ops) plus Leadership.
- [ ] **Check the founder-wall numbers** before launch (1,300+ companies, 16 unicorns,
  $24 Bn+ raised; source Tracxn, 2026) and what **HTSAS** stands for, if it should be spelt
  out.
- [ ] **Named contacts** on the contact page still use demo names (Zoya Khan, Dev
  Agarwal…). Replace with this year's cell heads, or delete the rows.
- [ ] **Key numbers** (events held, ventures listed, alumni network) no longer show on the
  homepage while the "Who we are" facts are filled in. They come back automatically if
  those are emptied.
- [ ] **Social links** (LinkedIn, Instagram, YouTube) and the **YouTube channel URL** are
  still placeholders.
- [ ] **IIMA Ventures website** link is still a placeholder.
- [ ] **Confirm** the campus address.

## 3. Events (admin → Events)

- [ ] **The next few real events**, each with a title, date and time, venue, a one-line
  subtitle and a **cover photo** (landscape 16:9, at least 1600 px wide). The homepage
  "Upcoming events" section and the hero's "Next up" line fill themselves from this.
- [ ] **Past events**: replace the seeded ones (Build Weekend 2026, Term Sheets Decoded, VC
  Teardown 2026, Founder Fireside, EntreFair 2025, Alumni Founders Panel) with real ones,
  including photos and recap text.

## 4. Startups (admin → Startups)

- [ ] **Remove the demo startups**: KisanQuery, PayLane, HostelKart and Notewell are seed
  data, not real companies.
- [ ] **Real listings**, only with the founders' written consent: name, one-line tagline,
  a short description, sector, stage, founders and batches, website, LinkedIn, and a
  **square logo** (SVG or PNG, at least 256 px). Without a logo the card shows the
  startup's initials, which is fine.
- [ ] Mark three as **featured** for the homepage.

## 5. Resources (admin → Resources, Playbook Chapters)

- [ ] **Replace the seeded resources.** Each currently reads "Seeded resource for
  development" and shows "Link coming soon". Each needs a real link, a two-line
  description, and the author or source.
- [ ] **Playbook chapters**, if the playbook is going live at launch.

## 6. Support (admin → Site Settings → IIMA Ventures, and Schemes)

- [ ] **Scheme details.** Seed Support Grant and Prototyping Lab Access both read "Seeded
  scheme description for development." Each needs its real name, summary, who it's for,
  what you get, eligibility, deadline and application link.
- [ ] **Check the "At a glance" line**: "Over 1,600 ventures supported since 2002." It needs
  to match IIMA Ventures' own published figure before launch.
- [ ] **Office contact**: name and email.

## 7. Team (admin → Team Members, Site Settings → Verticals)

- [ ] **This year's team**: name, role, vertical, batch, LinkedIn (with consent) and a
  **portrait photo** (4:5, at least 800 px tall, similar lighting for everyone if
  possible). The current names (Aarav Shetty, Ishita Bose, Dev Agarwal, Maya Pillai, …) are
  demo data.
- [ ] Put the leads first in display order; the team page lists people in that order.
- [ ] **Role contacts** for the Contact page (one email per vertical).

## 8. Partners (admin → Partners)

- [ ] **Every current partner and sponsor**: name, kind, website and a **logo** (PNG or
  SVG with a transparent background; it sits on a white tile). IIMA Ventures is already
  in, without a logo, so it shows as a wordmark until one is uploaded.
- [ ] Optional one-line blurb for each ("Co-hosts EntreFair"), shown on the About page.
- [ ] Biggest partners first: lower display order numbers come first.

## 9. Photography

- [ ] **A real team photo** for the Team page header. The current image is a placeholder
  render, not the club.
- [ ] **Event photos** from past sessions. Grade them consistently (warm and slightly dark
  works best on this design).
- [ ] The editorial renders in `public/images/editorial/` (the concrete arch with the red
  sphere, the notebook flat-lay) are only fallbacks for missing images. Every event and
  resource with its own photo stops using them.

## Facts used in the design

These are on the site now. Each was checked against the sources listed.

| Where | Text | Source |
|---|---|---|
| Hero drawing | Vikram Sarabhai Library, Louis I. Kahn | [IIMA: library restoration](https://iima.ac.in/news/louis-kahns-iim-ahmedabad-snk-completes-restoration-upgradation-vikram-sarabhai-library) |
| Hero drawing | Harvard Steps, Louis Kahn Plaza | [Studio Matrx: IIM Ahmedabad](https://www.studiomatrx.org/guides/iim-ahmedabad) |
| Hero drawing | 23°01′N 72°32′E | [Wikipedia](https://en.wikipedia.org/wiki/Indian_Institute_of_Management_Ahmedabad), [latitude.to](https://latitude.to/satellite-map/in/india/5538/indian-institute-of-management-ahmedabad) |
| Backdrop | 100 km Kármán line, 400 km low Earth orbit, Moon 384,400 km | Standard reference values |

Not on the site yet, but verified if you want an About page later: Vikram Sarabhai
co-founded IIM Ahmedabad in 1961 and chaired its first board, and set up INCOSPAR (which
became ISRO) in 1962 ([ISRO](https://www.isro.gov.in/sarabhaiformer.html),
[Wikipedia](https://en.wikipedia.org/wiki/Vikram_Sarabhai)).
