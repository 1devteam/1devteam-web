# 1devteam brand schema

Source of truth: ChatGPT company kit, 9 July 2026
(`docs/brand/source/1devteam-brand-board.jpeg`).

This is the company system, not the Ajenda product system.
Ajenda is crimson / Cinzel and lives separately.

## Role

| Layer | Name | Meaning |
|---|---|---|
| Company | 1devteam | Studio that builds systems |
| Line | P2iE | Product / process line shown on the banner |
| Product | Ajenda AI | Flagship — own mark and inbox |

## Color

| Token | Hex | Use |
|---|---|---|
| Electric blue | `#0066FF` | Primary, 1-stem, links, glow |
| Deep blue | `#0047B3` | Hover, pressed, secondary fill |
| Midnight | `#0A1120` | Dark surfaces, profile field, footer |
| Slate | `#667085` | Secondary text |
| Silver | `#D1D5DB` | Borders, hairlines |
| White | `#FFFFFF` | Light field, D-bowl on dark |

Do not use `#145BFF` (old site token). Official electric blue is `#0066FF`.

## Type

- Wordmark: **1DEVTEAM** — Inter / Arial / Helvetica, bold, wide tracking
- Tagline: **BUILDING INTELLIGENT SOLUTIONS** — same stack, medium, letterspaced
- Line: **P2iE** — italic bold, electric blue
- UI body: Inter

## Mark

The **1D** lockup is the company mark.

- Blue **1** is the left spine
- White or midnight **D** is the bowl
- A diagonal cut reads as a forward arrow through the D
- Never recolor the 1 to anything except electric blue
- Never outline, rotate, or add a drop shadow in product UI

### Variants (in `public/brand/`)

| File | Field | Use |
|---|---|---|
| `1devteam-mark.svg` | Dark | Mark only, white D |
| `1devteam-mark-dark.svg` | Light | Mark only, midnight D |
| `1devteam-mark-on-blue.svg` | Electric | Mark only, white D on `#0066FF` |
| `1devteam-profile.svg` | Dark, 1:1 | LinkedIn / avatar, 400×400 |
| `1devteam-profile-blue.svg` | Blue, 1:1 | Alternate avatar |
| `1devteam-logo-dark.svg` | Light | Header — mark + wordmark |
| `1devteam-logo-light.svg` | Dark | Footer — mark + wordmark |
| `1devteam-logo-stacked-dark.svg` | Light | Square lockup |
| `1devteam-wordmark-dark.svg` | Light | Type only |
| `1devteam-wordmark-light.svg` | Dark | Type only |
| `1devteam-banner.svg` | Dark, 1584×396 | LinkedIn / cover |

## Banner pillars

Keep this order and wording:

1. Autonomous Systems
2. Intelligent Automation
3. Data Solutions
4. Scalable Infrastructure
5. Secure by Design

## Clear space

Keep at least the width of the **1** stem around the mark. Do not put the mark smaller than 24px in UI or 16px as a favicon.

## Ajenda AI (product)

Source: `docs/brand/source/ajenda-brand-board.png`

| Token | Hex |
|---|---|
| Midnight Navy | `#0B1220` |
| Electric Blue | `#2563FF` |
| Cornflower | `#60A5FA` |
| Warm Off-White | `#F7F6F2` |
| Crimson | `#E0243B` |
| Signal Green | `#35D68A` |

- Mark: open **a** with a four-point sparkle (direction, alignment, clarity)
- Wordmark: lowercase `ajenda-ai` in Outfit
- UI type: Inter
- Line: *The intelligent mission operating system that turns business intent into governed action.*
- Product domain: ajenda-ai.com
- Inbox: ajenda@1devteam.com

Do not put Ajenda crimson on 1devteam chrome. Do not put the 1D mark on Ajenda product UI.

Public specimen: `/brand`

## Don't

- Don't flatten the 1 to gray
- Don't pair the 1devteam mark with a different tagline
- Don't mix the two palettes on the same lockup
- Don't stretch the banner
