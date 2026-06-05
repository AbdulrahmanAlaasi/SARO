# SARO Design System

Reference inspiration: **Aramex** (logistics structure, tracking-first hero, status clarity,
bilingual RTL). Identity: **SARO's own** — navy-led, not Aramex red.

Principles: clarity over decoration · tracking & status are the hero · trust-driven (PDPL)
· Arabic-first, fully bilingual (RTL/LTR) · operational density on dashboards, comfortable on public site.

## 1. Color tokens

### Brand
| Token | Hex | Use |
|-------|-----|-----|
| `navy` (primary) | `#001F5F` | Headers, primary buttons, brand |
| `navy-700` | `#0A2E7A` | Hover on primary |
| `navy-50` | `#EAF0FB` | Tints, selected rows |
| `accent` (CTA) | `#F59E0B` | Key calls-to-action, highlights (warm energy, Aramex-like) |
| `accent-600` | `#D97706` | Accent hover |

### Semantic — order status (most important UI signal)
| Status | Token | Hex |
|--------|-------|-----|
| Created | `status-created` | `#64748B` (slate) |
| Assigned | `status-assigned` | `#6366F1` (indigo) |
| Picked up | `status-pickedup` | `#0EA5E9` (sky) |
| In transit | `status-transit` | `#3B82F6` (blue) |
| Delivered | `status-delivered` | `#16A34A` (green) |
| Failed | `status-failed` | `#DC2626` (red) |
| Delayed (flag) | `status-delayed` | `#F59E0B` (amber) |

### Neutrals
Background `#F8FAFC` · Surface/card `#FFFFFF` · Border `#E2E8F0` · Text `#0F172A` ·
Muted text `#64748B`.

## 2. Typography
- **Arabic:** Cairo. **Latin:** Inter. (Both free, RTL-tested, pair well.)
- Scale: display 36/44, h1 30, h2 24, h3 20, body 16, small 14, caption 12.
- Weights: 400 body, 500 medium, 600 semibold headings, 700 display.

## 3. Shape & spacing
- Radius: `sm` 6px (inputs/badges), `md` 10px (buttons/cards), `lg` 16px (modals/hero panels).
- Spacing scale: Tailwind default (4px base). Section padding: 24px mobile / 48px desktop.
- Shadow: subtle only — `shadow-sm` cards, `shadow-md` on hover/elevated.

## 4. Components (built on Tailwind; shadcn/ui recommended)
- **Buttons:** primary = navy fill; secondary = navy outline; CTA = accent fill; radius md.
- **Status badge:** pill, semantic bg tint (10%) + solid text color.
- **Cards:** white, 1px border, radius md, shadow-sm.
- **Tracking timeline:** horizontal stepper (desktop) / vertical (mobile), colored by status.
- **Tables (dashboards):** compact rows, sticky header navy, zebra navy-50.
- **Forms:** labeled inputs, radius sm, clear focus ring (navy).

## 5. RTL / bilingual rules
- Use Tailwind **logical** utilities (`ps-`/`pe-`, `ms-`/`me-`, `start`/`end`) — never hard `left/right`.
- `dir` and `lang` flip on `<html>` via i18next (already wired).
- Icons that imply direction (arrows, chevrons) must mirror in RTL.
- Numbers/dates: support Arabic-Indic optionally; keep tracking codes LTR.

## 6. Layout patterns (from Aramex, SARO-styled)
- **Public hero:** headline + **tracking input front-and-center**, navy background, accent CTA.
- **Service tiles:** card grid for the 4 delivery methods (home, locker, home box, over-the-wall).
- **Dashboard shell:** sidebar (role nav) + topbar (lang switch, user, notifications) + content.
