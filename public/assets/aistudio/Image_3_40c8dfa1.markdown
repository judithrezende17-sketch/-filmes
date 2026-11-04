---
name: Lumina Cinema System
colors:
  surface: '#0a1513'
  surface-dim: '#0a1513'
  surface-bright: '#303b39'
  surface-container-lowest: '#06100e'
  surface-container-low: '#131e1b'
  surface-container: '#17221f'
  surface-container-high: '#212c2a'
  surface-container-highest: '#2c3735'
  on-surface: '#d9e5e1'
  on-surface-variant: '#bbc9cf'
  inverse-surface: '#d9e5e1'
  inverse-on-surface: '#273330'
  outline: '#859399'
  outline-variant: '#3c494e'
  surface-tint: '#47d6ff'
  primary: '#a5e7ff'
  on-primary: '#003543'
  primary-container: '#00d2ff'
  on-primary-container: '#00566a'
  inverse-primary: '#00677f'
  secondary: '#ffb3b3'
  on-secondary: '#680015'
  secondary-container: '#da0137'
  on-secondary-container: '#ffeceb'
  tertiary: '#d3dcff'
  on-tertiary: '#002a78'
  tertiary-container: '#acbfff'
  on-tertiary-container: '#0045b9'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b6ebff'
  primary-fixed-dim: '#47d6ff'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#ffb3b3'
  on-secondary-fixed: '#400009'
  on-secondary-fixed-variant: '#920022'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#0a1513'
  on-background: '#d9e5e1'
  surface-variant: '#2c3735'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  gutter-desktop: 2rem
  margin: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system translates the sensory, immersion-first environment of an architectural cinema hall into a modern digital streaming platform. The design narrative rejects standard flat interfaces in favor of deep atmospheric presence, where the interface mimics a dark auditorium, allowing narrative video content, dynamic key art, and curated cinematic imagery to radiate off the surface.

The target audience spans cinephiles, premium entertainment subscribers, and casual viewers seeking a theater-grade digital experience. The emotional response must evoke anticipation, dramatic tension, and curated luxury—reminiscent of the moments immediately after the auditorium lights fade to black and the projection beam strikes the screen.

### Design Movement & Aesthetic Direction
- **Atmospheric Cinematic Glass & Radiance:** Combines deep, light-absorbing obsidian-teal undertones with focused projection-like luminous flares and frosted dark-panel overlays.
- **Optic Lens Dynamics:** UI interactions simulate optical lens phenomena: controlled anamorphic glow accents, ultra-fine chromatic edge reflections, and soft luminous back-lighting behind focal media tiles.
- **Editorial Film Layout:** Structured, high-tension modular sections that give breathing room to photography, dramatic type-setting, and full-bleed hero sequences without interface clutter.

## Colors

The color palette is engineered specifically for deep dark mode, mimicking the chromatic balance of an intimate cinema chamber equipped with laser projection.

### Atmospheric Surfaces (Neutrals)
- **Deep Void (`#060D0B`):** The foundational ground level; a deep, light-absorbing black-teal base used for the viewport background, video player viewports, and outer borders.
- **Chamber Surface (`#091412`):** Primary canvas layer for rows, panels, and sidebars. Provides chromatic warmth compared to standard lifeless dark neutrals.
- **Elevated Stage (`#0D1F1C`):** Higher surface containers, active modals, floating dock menus, and interactive card states.
- **Glass Overlay (`rgba(13, 31, 28, 0.72)`): Blended surface layer over media with backdrop filtration.

### Luminescent Accents
- **Electric Cyan (`#00D2FF` - Primary):** The laser beam signature. Utilized for primary interactive nodes, active playheads, focus states, streaming quality badges (4K, HDR, Dolby Atmos), and high-visibility calls to action.
- **Projection Sapphire (`#2563EB` - Tertiary):** Secondary technical focus, supporting gradients, live event feeds, and progress rail fills.
- **Ruby Curtain (`#FF2E4D` / `#E50914` - Secondary):** Reserved for dramatic emotional triggers: premier announcements, "Live" indicators, bookmarking/favorite triggers, critical alerts, and explicit cinematic rating tags.

### Text & Contrast Hierarchy
- **Text High-Emphasis:** `#F0FDF8` (Soft cinematic white with a microscopic cool green cast, eliminating harsh contrast fatigue).
- **Text Medium-Emphasis:** `#94A8A3` (Muted silver-sage for metadata, subtitles, runtimes, and genre tags).
- **Text Low-Emphasis:** `#4D635F` (Subtle metadata, copyright, disabled state icons).

## Typography

The typographical palette uses **Plus Jakarta Sans** across all levels to create an uninterrupted geometric voice with clean, wide-aperture forms that retain maximum legibility on high-resolution displays, TV dashboards, and handheld OLED screens.

### Typographic Treatment & Hierarchy
- **Display and Title Tiers:** Rendered with tighter negative tracking (`-0.03em` to `-0.015em`) and strong geometric weights (700 and 800) to project theatrical weight and poster-like impact.
- **Labels & Spec Badges:** Formatted in uppercase with distinct tracking (`+0.04em` to `+0.08em`) for specifications such as `IMAX ENHANCED`, `4K UHD`, `DOLBY VISION`, and running durations.
- **Body Copy:** Maintains an airy line-height (`1.6x` font size) to deliver frictionless synopsis reading against dark, textured backgrounds.

## Layout & Spacing

The layout structure utilizes a dynamic 12-column fluid grid system on desktop and tablet, collapsing into a 4-column flow on mobile viewports.

### Breakpoints & Geometry
- **Mobile (< 768px):** 4-column structure, `1rem` outer canvas margins, `0.75rem` gutters. Horizontal scrolling carousels bleeds to screen edge with negative margins.
- **Tablet (768px – 1199px):** 8-column structure, `2rem` outer margins, `1.5rem` gutters.
- **Desktop (1200px+):** 12-column structure, `3.5rem` outer canvas margins, `2rem` gutters. Maximum layout clamp set to `1600px` for ultra-wide monitors to maintain optimal horizontal scanning arcs.

### Spacing Cadence
- Content carousels and poster rows are spaced vertically using `space-xl` (`2.5rem`), establishing rhythmic separation between curated thematic shelves.
- Micro-spacing inside content blocks, badge clusters, and control groups strictly adheres to standard increments derived from `space-xs` (4px), `space-sm` (8px), and `space-md` (16px).

## Elevation & Depth

Visual depth is produced not through drop shadows alone, but through light emission and lens physics simulated against deep, non-reflective surfaces.

### Surface Tiers & Radiance Hierarchy
1. **Level 0 (Auditorium Void - `#060D0B`):** Deepest background plane; total absorption.
2. **Level 1 (Shelf Canvas - `#091412`):** Primary structural plane for content rails and grid sections.
3. **Level 2 (Glass Containers - `#0D1F1C` with 70% opacity + `backdrop-filter: blur(16px)`):** Hovering controls, navigation headers, player overlays, and media drawer panels.
4. **Level 3 (Spotlight/Hovered Media):** Scaled elements lift along the z-axis using a dual-depth light model:
   - **Contact Shadow:** Soft structural ambient shadow (`0 12px 32px rgba(0, 0, 0, 0.7)`).
   - **Anamorphic Beam Glow:** Underlying cyan/ruby dispersion aura (`0 0 40px rgba(0, 210, 255, 0.22)` or `0 0 40px rgba(255, 46, 77, 0.2)` on premiere titles).

### Edge Illumination
Elevated panels feature an ultra-fine, single-pixel translucent border (`rgba(255, 255, 255, 0.08)` to `rgba(0, 210, 255, 0.25)` on active items), evoking the sharp, chamfered rim of high-end optical glass.

## Shapes

The system relies on balanced roundedness (`roundedness: 2`), applying an 8px (`0.5rem`) base corner radius across all interactive inputs, film thumbnails, and badges, stepping up to 16px (`1rem`) on prominent cards and modal wrappers.

### Geometry Guidelines
- **Standard Media Cards (Poster 2:3, Backdrop 16:9):** `8px` (`0.5rem`) radius. Maintains structural precision reminiscent of framed photographic stills.
- **Pills & Status Indicators:** Full-radius capsules for actionable tags, genre filters, and rating chips.
- **Focus Rings:** Concentric radius offset by 3px with a 2px stroke width, matching the corner curvature of the parent element.

## Components

### Buttons
- **Primary Action (Watch Now / Play):** Solid Electric Cyan background (`#00D2FF`), deep obsidian typography (`#060D0B`), weight 700. On hover, radiates a subtle cyan glow (`box-shadow: 0 0 24px rgba(0, 210, 255, 0.45)`) and expands by `scale(1.02)`.
- **Secondary Action (Add to List / Trailer):** Translucent teal-tinted glass surface (`rgba(13, 31, 28, 0.75)`), white high-emphasis text, bordered by `1px solid rgba(255, 255, 255, 0.15)`. On hover, border illuminates to `#00D2FF`.
- **Destructive / Premiere Special:** Ruby Red background (`#FF2E4D`), white typography, with a ruby atmospheric light aura on focus.

### Media Cards (Poster & Backdrop)
- **Resting State:** 2:3 or 16:9 aspect ratio, 8px radius, hidden overflow, subtle 1px border (`rgba(255, 255, 255, 0.06)`).
- **Active / Hover State:** Smooth transform `scale(1.05)` with `cubic-bezier(0.2, 0.8, 0.2, 1)`. Bottom edge overlays a rich gradient scrim (`linear-gradient(to top, #060D0B 0%, transparent 60%)`) revealing quick-actions, runtime, and match rating.

### Chips & Metadata Tags
- **Technical Badges (4K, HDR, Atmos):** Monospaced-tracked label-sm, background `rgba(255, 255, 255, 0.08)`, text `#94A8A3`, border `1px solid rgba(255, 255, 255, 0.12)`, padding `2px 8px`.
- **Genre Filter Chips:** Capsule shape (`pill`), dark glass background. When selected, shifts to border `#00D2FF` with text color `#00D2FF` and subtle cyan backlight.

### Input Fields & Search Bars
- **Surface:** Deep `#091412` with 8px radius, padding `12px 16px`, text `#F0FDF8`.
- **Inactive Border:** `1px solid rgba(255, 255, 255, 0.1)`.
- **Focus State:** Border shifts instantly to `#00D2FF`, accompanied by an inner optical blur glow (`box-shadow: inset 0 0 8px rgba(0, 210, 255, 0.15), 0 0 16px rgba(0, 210, 255, 0.2)`).

### Checkboxes & Toggle Controls
- **Checkboxes:** 20px squares, 4px rounded radius. Unchecked shows dark translucent fill with muted border; checked state triggers solid Electric Cyan fill with obsidian checkmark icon.
- **Toggles:** Pill-shaped track (`#0D1F1C`), Electric Cyan thumb knob with an ambient glow upon activation.

### Video Player Controls & Progress Scrubber
- **Progress Track:** 4px thickness, background `rgba(255, 255, 255, 0.2)`. Buffer track shows `rgba(255, 255, 255, 0.4)`. Played track fills with `#00D2FF`.
- **Scrubber Thumb:** 14px circle with `#00D2FF` fill and a pulsating cyan aura on scrub interaction.