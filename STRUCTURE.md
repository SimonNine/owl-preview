# OW Logistics — Site Structure

**Home stays at the root** (`index.html`). Every other page is a **top-level folder
whose slug matches the live owlogistics.com URL** — e.g. `/partners/`, `/leadership/`,
`/ocean-freight/` (NOT nested under `/about/` or `/services/`). A page is just an
`index.html` in that folder; empty folders hold a `.gitkeep` placeholder.

> **Global header & footer are NOT in the page files** — they're injected by XTheme
> (WordPress). Pages reserve room for the header via the `--header-h` token.

```
website-concept/
├── index.html                              ← HOME (the one-page concept)
│
├── assets/                                 ← shared, hand-authored front-end
│   ├── css/global.css                      ← ★ design tokens + shared UI (single source of truth)
│   └── js/global.js                        ← ★ shared behaviours (reveal, count-up, carousel, parallax)
├── vendor/                                 ← third-party libs, fonts, logos, media (GSAP, images…)
│
├── about/        ✅ built                   ← /about/   (essence / positioning page)
├── partners/     ✅ built                   ← /partners/ (strategic partner network)
├── leadership/                             ← /leadership/
├── locations/                              ← /locations/
├── industries/                             ← /industries/  (also a section on the home page)
├── careers/                                ← /careers/
├── ocean-freight/                          ← /ocean-freight/        ┐
├── air-freight/                            ← /air-freight/          │ "Services" mega items
├── origin-management-services-control-towers/  ✅ built   ← (Origin Mgmt & CT) │ (no /services/ landing
├── destination-management-services/  ✅ built  ← /destination-management-services/ ┘  on the live site)
├── technology/                             ← /technology/  (OWL Vision)
├── tour/                                   ← /tour/
├── news/                                   ← /news/
├── contact/     ✅ built                   ← /contact/ (live URL /contact-us/)
└── demo/        ✅ built                   ← /demo/    (Book a demo — OWL Vision)
```

> **Forms (Contact + Demo)** are custom-styled but post to the **live OWL HubSpot
> forms** (portal `43156652`) via the HubSpot Forms submission API. Shared form
> component lives in `assets/css/global.css`; validation + submit in
> `assets/js/owl-forms.js`. From `file://` the send is simulated so the flow is
> reviewable offline; on `https` it performs the real submission.

> Navbar grouping ≠ folder nesting. The navbar shows Leadership/Partners/Locations
> under the "About" dropdown and the freight pages under "Services", but their URLs
> (and therefore folders) are flat, top-level slugs — matching the live site.

## Global styles & scripts (single source of truth)

Colours, fonts, spacing, the mesh-gradient backdrop, buttons, eyebrows and the
reveal-on-scroll system live in **`assets/css/global.css`** and **`assets/js/global.js`**.
Change a colour or font in one place and it updates every page that links them.

Each page links them (paths are relative to the page depth — one level deep = `../`):

```html
<link rel="stylesheet" href="../assets/css/global.css" />
...
<script src="../vendor/gsap.min.js"></script>
<script src="../vendor/ScrollTrigger.min.js"></script>
<script src="../assets/js/global.js"></script>
```

Shared hooks provided by the globals:
- `class="bg-morph"` block → the living mesh-gradient background
- `.wrap` · `.eyebrow` · `.btn`/`.btn-red`/`.btn-dark`/`.btn-ghost` · `.lede` · `.display`
- `.rv` → fades up on scroll · wrap a grid in `data-rv-group` to stagger its `.rv` children
- `<span data-count="100" data-suffix="%">` → counts up on scroll

> **TODO:** retro-fit the homepage (`index.html`) to consume these globals instead of
> its own inline `:root` + components, so the whole site shares one system.

## Navbar → destination

The nav currently points at the **live owlogistics.com** pages (until the local
pages above are built), except where we've added something new.

| Nav item | Folder (future local page) | Currently links to |
|---|---|---|
| Home | `/` (`index.html`) | `index.html#top` |
| About → What We Do | `about/` | `owlogistics.com/about/` |
| About → Leadership | `about/leadership/` | `owlogistics.com/leadership/` |
| About → Partners | `about/partners/` | `owlogistics.com/partners/` |
| About → Locations | `about/locations/` | `owlogistics.com/locations/` |
| About → Industries | `about/industries/` | `index.html#industries` *(new — home section)* |
| About → Careers | `about/careers/` | `owlogistics.com/about/` *(no live page yet)* |
| Services → Ocean Freight | `services/ocean-freight/` | `owlogistics.com/ocean-freight/` |
| Services → Air Freight | `services/air-freight/` | `owlogistics.com/air-freight/` |
| Services → Origin Mgmt & Control Towers | `services/origin-management-control-towers/` | `owlogistics.com/origin-management-services-control-towers/` |
| Services → Destination Management | `services/destination-management/` | `owlogistics.com/destination-management-services/` |
| Technology | `technology/` | `owlogistics.com/technology/` |
| Tour | `tour/` | `owlogistics.com/tour/` |
| News | `news/` | `owlogistics.com/news/` |
| Contact | `contact/` | `owlogistics.com/contact/` |

When a local page is built, repoint its nav link from the owlogistics.com URL to the
local folder (e.g. `about/leadership/`).

---
Designed & built by Studio Nine — https://studionine.agency
