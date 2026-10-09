---
name: Zaaduna
description: A classical treatise page at night — set text in one column, the lecture's own words in the margin.
colors:
  night: "#0B1E2E"
  night-deep: "#071722"
  night-raise: "#0F2838"
  night-plate: "#10303F"
  ink: "#EFE6D6"
  ink-2: "#A8B8B0"
  ink-3: "#74898A"
  lamp: "#F9BC81"
  lamp-deep: "#B57135"
  rubric: "#D4764A"
  rubric-dim: "#7E3C26"
  dome: "#5E9A6E"
  dome-dim: "#2A4F39"
  rule: "rgba(239,230,214,.14)"
  rule-soft: "rgba(239,230,214,.07)"
  rule-lamp: "rgba(249,188,129,.34)"
typography:
  display:
    fontFamily: "Literata, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(28px, 7.6vw, 38px)"
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "-0.021em"
  headline:
    fontFamily: "Literata, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(23px, 5.9vw, 29px)"
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "-0.021em"
  title:
    fontFamily: "Literata, Georgia, 'Times New Roman', serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "-0.021em"
  lede:
    fontFamily: "Literata, Georgia, 'Times New Roman', serif"
    fontSize: "17px"
    fontWeight: 300
    lineHeight: 1.62
  body:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tabular-nums lining-nums"
  body-set:
    fontFamily: "Literata, Georgia, 'Times New Roman', serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.6
  arabic:
    fontFamily: "Amiri, 'Scheherazade New', serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.95
  label:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "10.5px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.12em"
  runhead:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "11.5px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.16em"
  folio:
    fontFamily: "'Golos Text', system-ui, -apple-system, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    letterSpacing: "0.06em"
    fontFeature: "tabular-nums lining-nums"
  figure:
    fontFamily: "Literata, Georgia, 'Times New Roman', serif"
    fontSize: "34px"
    fontWeight: 400
    letterSpacing: "-0.025em"
    fontFeature: "tabular-nums lining-nums"
rounded:
  none: "0px"
  field: "2px"
  dot: "50%"
spacing:
  hair: "2px"
  xs: "6px"
  sm: "9px"
  md: "14px"
  lg: "16px"
  xl: "20px"
  gutter: "20px"
  gutter-wide: "32px"
  margin-gap: "44px"
components:
  button-action:
    textColor: "{colors.lamp}"
    typography: "{typography.runhead}"
    rounded: "{rounded.none}"
    padding: "19px 14px"
  button-action-hover:
    backgroundColor: "{colors.night-raise}"
    textColor: "{colors.lamp}"
  button-back:
    textColor: "{colors.ink-3}"
    typography: "{typography.folio}"
    rounded: "{rounded.none}"
    padding: "19px 14px 19px 0"
  button-check:
    textColor: "{colors.lamp}"
    rounded: "{rounded.field}"
    padding: "12px"
    width: "100%"
  button-check-disabled:
    textColor: "{colors.ink-3}"
    rounded: "{rounded.field}"
    padding: "12px"
  button-reveal:
    textColor: "{colors.lamp}"
    rounded: "{rounded.field}"
    padding: "13px"
    width: "100%"
  option-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "14px 2px"
  option-row-hover:
    backgroundColor: "{colors.night-raise}"
  option-row-correct:
    textColor: "{colors.dome}"
  option-row-wrong:
    textColor: "{colors.rubric}"
  verdict-button:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.none}"
    padding: "9px 10px"
  verdict-button-chosen:
    textColor: "{colors.lamp}"
  verdict-button-right:
    textColor: "{colors.dome}"
  verdict-button-wrong:
    textColor: "{colors.rubric}"
  select-field:
    backgroundColor: "{colors.night-raise}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
    width: "100%"
  excerpt-margin:
    textColor: "{colors.ink}"
    typography: "{typography.body-set}"
    rounded: "{rounded.none}"
    padding: "0 0 0 18px"
    width: "15em"
  rubric-label:
    textColor: "{colors.rubric}"
    typography: "{typography.label}"
  gauge:
    backgroundColor: "{colors.rule-soft}"
    height: "1px"
    width: "100%"
  gauge-fill:
    backgroundColor: "{colors.lamp-deep}"
    height: "1px"
---

# Design System: Zaaduna

## Overview

**Creative North Star: "The Night Treatise Page"**

Zaaduna is a page from a classical treatise. One column of set text runs down the left; the lecture's own words sit in the margin beside the line they answer, joined to it by a hairline. The ground — paper by day, near-black by night — is flat, with no panel ever a different shade of it except on hover. Everything else is ink, rule and rubric, carried by two colours: navy leads, gold draws the lines. The boat on the logo gives the pairing, hull in gold under navy sails.

The density is editorial, not app-like. Inside a chapter there are no cards; a block earns its boundary from a 1px rule and a small cinnabar rubric label, the way a manuscript band earns it from ruling and a marginal heading. Figures are tabular everywhere, so the folio counter and the final score sit still. Radius is effectively absent (2px only on fields the browser would otherwise render as native chrome), and there are no shadows at all — depth comes from the rule hierarchy and from one single lit element per screen.

The rejected world is explicit: the centred question card with a progress bar on top and a large pill button at the bottom — the posture of a quiz app, where the source hides behind "show explanation" and disappears on the next screen. Two earlier systems preceded this one — a green-on-warm-milk product UI, then a night treatise lit by a single amber lamp; neither is authority here, and a snapshot of the second sits in `old/` for comparison only.

**Key Characteristics:**
- One flat ground: a single background, no fills behind blocks, no gradients.
- 1px rules and rubric labels instead of containers.
- Exactly one amber element per screen: the live action.
- The source excerpt enters the margin and never leaves.
- State is readable without colour: a word label plus a hairline mark.
- Tabular lining figures globally; three type voices (set, apparatus, Arabic).
- Night-only by agreement: no light theme ships.

## Colors

Two colours and a neutral scale — nothing else. Deep navy leads; gold answers. The pairing comes from the logo, where the dhow carries a gold hull under navy sails, and the interface simply obeys it.

Gold is not a text colour. `#B68B55` on `#FAF8F2` measures about 3:1, which fails AA for body sizes, so letters are navy and gold is kept for what does not have to be read: rules, 2px borders, the gauge fill, the wrong-answer wash. Where gold does carry a glyph it sits on `--gold-tint`, against ink, not against the page.

### Primary
- **Navy** (`#1A355C` light / `#7FA6D6` dark): every live action and every rubric. Buttons, links, the running head, list markers, the selected control, the focus ring, and the correct-answer fill. Because navy now does the work two colours used to do, rank is carried by weight, size and placement rather than hue.
- **Navy Dark** (`#12274A` / `#A9C4E6`): the third triptych stroke and any navy that must sit against navy.
- **Navy Tint** (`#E8EDF3` / `#1B2736`): the only tonal step in the system — row and button hover, the body of a select field.

### Secondary
- **Gold** (`#B68B55` / `#D2AE5C`): rules and borders. The 2px frame on a wrong answer, the gauge fill, the dhow's hull, the margin tie. Never set text on the page ground.
- **Gold Tint** (`#F6EDD8` / `#2C2617`): the wash behind a wrong answer — the one place a signal colour becomes a fill, and even there a glyph and a word do the telling.

### Neutral
- **Bg** (`#FAF8F2` / `#14181C`): the ground of every surface, the fixed colophon included, so the colophon reads as the foot of the sheet rather than a bar.
- **Card** (`#FFFFFF` / `#1D2227`): reserved for inset contexts; no surface is filled with it today.
- **Ink / Ink Soft / Ink Faint** (`#1E2A33` `#55606A` `#8A929A` / `#EDEBE3` `#A9B2BB` `#737C85`): set text, secondary apparatus, and the quietest register — isnad chain, source credits, captions, disabled text.
- **Line / Line Soft** (`#E2DDD0`, `rgba(30,42,51,.10)` / `#303840`, `rgba(237,235,227,.10)`): band edge and intra-list divider.
- **On Navy** (`#FFFFFF` / `#14181C`): text laid on a navy fill. It flips in dark mode because navy itself becomes light there; without it the correct answer would be pale text on a pale field.

### Light and dark
Light is the base. Dark arrives from `prefers-color-scheme`, so the page matches how the reader has set everything else, and the switch in the `.isnad` header overrides the system when they want otherwise — a word, not an icon, set like the folio beside it, naming what you *get* by pressing. The attribute is written by a short inline script in `<head>` so the page cannot flash the wrong ground first. The konspekt is excluded: it is printed, and printed sheets are light.

### Named Rules
**The Two Colour Rule.** Navy and gold, plus neutrals. A third hue is a defect, including green for right and red for wrong.

**The Gold Is A Line Rule.** Gold draws, fills and frames; it does not spell. Any gold text on the page ground is a contrast failure.

**The Never Colour Alone Rule.** Correct is a navy fill *and* a ✓ *and* the word; wrong is a gold frame *and* a ✗ *and* the word, with the correct answer still marked beside it. Read in greyscale, or by someone who cannot separate the hues, the verdict must survive intact.

**The Flat Field Rule.** The ground is flat. The only permitted tonal shift is `--navy-tint` as hover or field body; no gradients, no tinted panels, no shadows.

## Typography

**Display Font:** Literata (with Georgia, Times New Roman, serif) — the set text face: headings, ledes, quotations, excerpts, figures.
**Body Font:** Golos Text (with system-ui, sans-serif) — the apparatus: UI copy, labels, rubrics, counters, controls.
**Arabic Font:** Amiri (with Scheherazade New, serif) — Qur'anic and hadith text, set `dir="rtl"`, right-aligned, at a generous 1.95 line-height.

**Character:** A scholarly serif for anything that *is* the text, a tight neutral sans for the apparatus around it. Both are real webfonts loaded in the document head; no system display face stands in for a heading. The pairing reads as a modern printing of an old book rather than as a product UI.

### Hierarchy
- **Display** (500, `clamp(28px, 7.6vw, 38px)`, 1.16, −0.021em): the chapter and screen opening heading, balanced (`text-wrap: balance`). One per screen.
- **Headline** (500, `clamp(23px, 5.9vw, 29px)`, 1.16): the screen title inside a flow of blocks.
- **Title** (500, 19px, 1.16): subheadings, and the scale partner of the result line.
- **Lede** (300, 17px, 1.62): the opening set paragraph; `text-wrap: pretty`, measure capped at 34em.
- **Body** (400, 16px, 1.6, tabular lining figures): all apparatus copy, option rows, statements, controls.
- **Body Set** (400, 15–15.5px, 1.6, often italic): quotations, citations, principles, prompts, and the marginal excerpt — italic marks "these are the words themselves".
- **Arabic** (400, 21px, 1.95): Arabic quotation, RTL, right-aligned.
- **Label** (400, 10.5–11px, 0.10–0.14em, uppercase): rubric labels, state words («ВЕРНО», «ВАШ ВЫБОР», «В ЛЕКЦИИ ЕСТЬ», «В ЛЕКЦИИ НЕТ»), captions, source credits.
- **Runhead** (500, 11.5px, 0.16em, uppercase, cinnabar): the screen's rubric in the running head.
- **Folio** (400, 12.5px, 0.06em, tabular): the `01 — 14` counter, current step in full ink.
- **Figure** (400, 34px, −0.025em, tabular): the final score.

### Named Rules
**The Three Voices Rule.** Literata is the text, Golos Text is the apparatus, Amiri is the Arabic. A string never changes voice to decorate itself; it changes voice because its role changed.

**The Running-Head Rubric Rule.** A screen's rubric belongs in the running head, set in cinnabar small caps. Nothing is set above a heading in the text column — the heading is the first thing in the column, always.

**The Tabular Figure Rule.** `font-variant-numeric: tabular-nums lining-nums` is global on body. Counters, scores, and step numbers must not shift width as they change.

### Hyphenation
Russian words are long and the measure is narrow, so the right edge frays, worst of all on a phone. `hyphens: auto` on `body` lets the browser break them by dictionary; the dictionary is chosen by `lang="ru"` on `<html>`, so that attribute is load-bearing and must not be dropped. `hyphenate-limit-chars: 6 3 3` keeps it from splitting short words or leaving two letters stranded.

Only running text is hyphenated. Headings, the uppercase apparatus (`.chain`, `.runhead`, `.folio`, `.path`, rubrics, source lines, the feedback labels drawn with `::after`), the buttons, and Arabic are set to `hyphens: none` — a broken heading reads as damage, letterspaced capitals worse, and Arabic breaks by rules the browser does not have. The konspekt carries the same pair, where it matters most: on paper the line has nowhere to go.

Confirmed rendering on the live site. Where a dictionary is missing the declaration is simply inert, so the fallback is exactly today's ragged edge — no layout risk either way.

## Layout

A single centred sheet, `max-width: 61em`, padded by a gutter of 20px that opens to 32px at 900px. The set column is measured, not fluid: `--measure: 34em` caps reading width.

At **≥900px** the active screen becomes a two-column grid — `minmax(0, 34em)` for the set column and `minmax(15em, 23em)` for the margin — with a 44px column gap. Everything defaults to column 1; only the excerpt takes column 2, spanning all rows (`grid-row: 1 / span 40`) so it cannot stretch the first row and shove the set column sideways. Its vertical position is not a grid alignment but a measured `margin-top` written by script to the offset of the answered row.

Below **900px** there is no margin: the excerpt stays in document flow after the widget, its tie drawn as a vertical hairline whose height is measured up from the answered row's bottom edge.

Chrome is top and bottom. The top is the isnad strip: the attribution chain in 10.5px slate small caps, the screen rubric under it in cinnabar, and the folio counter right-aligned and vertically centred across both rows, its two figures split by a 14px hairline. Under the strip, a 1px gauge — a hairline filled from the left by `scaleX`, which is the entire progress indicator. The bottom is a full-bleed colophon fixed to the viewport: one hairline across the top, the back action and the forward action side by side with a hairline between them, padded into `env(safe-area-inset-bottom)`. The body reserves 96px of bottom padding for it, 168px below 900px so a settled excerpt can scroll clear.

Vertical rhythm is editorial and small: 14px between paragraphs, 16px band padding, 20px between blocks, 13–16px row padding inside ruled lists.

**Motion.** One axis, 320ms, `cubic-bezier(.16,1,.3,1)`. The excerpt enters with `translateX(-34px)` plus opacity, and nothing ever animates back out. Scroll correction is hand-animated on `requestAnimationFrame` over 320ms with a cubic ease-out, because `behavior: "smooth"` is silently unreliable in embedded webviews. `prefers-reduced-motion` drops the entrance animation and the gauge transition and clamps all transitions to 1ms.

### Named Rules
**The Hairline Separation Rule.** Blocks are separated by a 1px rule and a rubric label, never by a card, a fill, or a shadow. Band edges take `{colors.rule}`; dividers inside a list take `{colors.rule-soft}`.

**The Margin Rule.** Once the source excerpt enters the margin it stays for the rest of the chapter. Nothing in this system opens and then closes.

**The Hairline Gauge Rule.** Progress is a 1px rule filling from the left. No bar, no track chrome, no percentage label.

## Elevation & Depth

No shadows anywhere. The system has no shadow vocabulary and none should be invented for it: there is no `box-shadow` in the stylesheet except `inset` rings used to solid-fill a 13px radio dot and a 14px checkbox. Depth is entirely a matter of ruling weight and ink weight — three rule alphas (`.14`, `.07`, amber `.34`) and three inks establish every plane the surface needs. The one tonal move, `{colors.night-raise}`, is reserved for hover and select bodies; it reads as a row waking up, not as a raised card. The fixed colophon sits on the night ground with a single top hairline, deliberately refusing to look lifted.

### Named Rules
**The No-Shadow Rule.** Nothing in this world casts a shadow. If an element needs to separate, give it a rule; if it needs to come forward, give it the lamp.

## Shapes

Rectilinear and unrounded. Radius never exceeds 2px, and 2px appears only on form fields (`select`, the check and reveal buttons, the 14px checkbox) where a hard 0 would read as unstyled native chrome. Colophon actions and list rows have no radius at all. The only curve in the system is the 13px radio dot, a full circle.

Borders are the primary form device and are always exactly 1px. Four border idioms recur: the **band** (top and bottom rule, no sides) for quotations and callouts; the **marginal stroke** (left border only) for principles, prompts, and the excerpt; the **ruled list** (top rule on the list, soft rule between rows, full rule under the last) for options, checks, true/false items, and downloads; and the **tie** (a 1px bracket, 44px horizontal in the margin layout, a measured vertical in flow) joining the excerpt to its row. Marginal state marks are 1px vertical strokes offset −12px into the gutter.

Icons are a hand-drawn inline SVG set (`MARKS` in `engine.js`) on a 24px box at a single 1.3 stroke weight (1.6 for the tick), inheriting `currentColor` — rosette, pin, mind, note, audio, arrow, down, tick. No icon fonts, no emoji, no Unicode glyphs standing in for marks.

### Named Rules
**The 2px Ceiling Rule.** 2px is the maximum radius in this world, and it is a concession to form fields, not a style. Everything else is square.

**The One Stroke Weight Rule.** Every rule in the system is 1px and every drawn mark is 1.3 on a 24px box. There is no second line weight to reach for.

## Components

### Buttons
- **Shape:** square in the colophon and in lists (0px); 2px on the check and reveal actions.
- **Forward action** (colophon): amber text on night, uppercase 13px tracked 0.14em, `padding: 19px 14px`, flex-filling the colophon. This is the screen's one lamp.
- **Back action**: slate 14px, min-width 92px, separated from the forward action by a 1px rule; brightens to full ink on hover; hidden on the first screen.
- **Check**: full-width, amber text inside a 1px amber-rule border, uppercase 13.5px tracked 0.09em, `padding: 12px`. Hover fills `{colors.night-raise}` and brings the border to full amber. Disabled after a successful check — border drops to `{colors.rule}`, text to slate, cursor default, `aria-disabled="true"`.
- **Reveal**: the same amber-ruled rectangle at 14px without uppercase, for screens that disclose an answer sheet.
- **Download**: a ruled list row rather than a button — full-width, label left, amber SVG mark right; hover tints the row and turns the label amber.
- **Hover / Focus:** colour and background transition at 320ms on the house ease. Focus is a global 1px amber outline at 3px offset via `:focus-visible`; `:focus` itself is suppressed.

### Cards / Containers
Inside a chapter the container idiom is the **band**: `border-top` and `border-bottom` in `{colors.line}`, `padding: 16px 0`, `margin-bottom: 20px`; no side borders, no fill, no radius, no shadow. Bands run full width of the column so the rule reads as ruling, not as a box. (A legacy `.card` class name survives in markup; what it styles is a band.)

The **one framed block** in the system is the cycle on the contents page: a 1px border on all four sides, `border-radius: 2px`, and a 2px edge down the left — gold when the cycle is open, line-coloured when it is still being prepared. The contents page is a list of separate things a reader chooses between, and a frame says where one ends and the next begins more plainly than a divider can. The frame stays hairline and unfilled on purpose: a fill would turn the list into tiles, and it is still a list read top to bottom. Nothing inside a chapter takes a frame — a boxed question is still the quiz posture this system rejects.

### Inputs / Fields
- **Select (ordering):** `{colors.night-raise}` body, 1px `{colors.rule}` border, 2px radius, `padding: 11px 12px`, native appearance stripped, caret drawn from two slate gradient triangles. Focus turns the border amber; correct turns border and text dome green; wrong turns them cinnabar.
- **Select (inline, fill-blank):** borderless except a 1px amber-rule underline, amber text, sized to sit inside a 1.85 line-height sentence; goes dome or cinnabar on verdict.
- **Radio row:** a ruled list row with a 13px circular dot stroked in slate; selection fills it with a 3px inset amber ring. Verdict re-strokes the dot and appends a tracked uppercase label («верно» / «ваш выбор») flush right.
- **Checkbox row:** a 14px 2px-radius box stroked in slate, filled amber with a night-coloured tick on select; verdict fills dome or cinnabar, adds a 1px marginal stroke at −12px, and appends «в лекции есть» / «в лекции нет».
- **Verdict pair (true/false):** two flex-equal 1px-ruled buttons at 13.5px in sage ink; chosen goes amber, right goes dome with an SVG tick, wrong goes cinnabar with a line-through, and the item grows a 1px marginal stroke in its verdict colour.
- **Error message:** hidden until needed, then a cinnabar left rule with 13px cinnabar text and `role="alert"`.

### Navigation
Navigation is the colophon plus the isnad strip; there is no nav bar and no menu. The colophon is fixed, full-bleed night with one top hairline, carrying back (slate) and forward (amber) with a 1px divider. The forward label changes by position — «Начать» / «Далее» / «Готово». Inside Telegram the native MainButton and BackButton mirror the same two actions. The isnad strip and gauge mark position: chain, rubric, folio `NN — NN`, hairline fill.

### The Margin Excerpt (signature)
The source excerpt is the system's signature component and its thesis. After «Проверить», the excerpt is reparented to be a direct child of the screen (never inside the widget, where a screen reader would hear it as one more option), given `aria-describedby` from the answered control, and shown.

At ≥900px it occupies the margin column spanning all rows, positioned by a script-written `margin-top` equal to the answered row's offset from the top of the screen, with a 44px horizontal hairline tie reaching left from its top edge to that row. It carries a left 1px amber rule, `padding-left: 18px`, a cinnabar uppercase label («Выдержка из текста»), and italic Literata at 14.5px/1.62.

Below 900px it stays in flow with a vertical hairline tie whose height is measured from the answered row's bottom (floor 14px), and the page glides just far enough that the colophon does not cover it (`scroll-margin-bottom: 96px`). Ties are re-measured on resize and on breakpoint change. It enters once, on one axis, and never closes.

### The Dhow Cursor
زاد is the provision taken on a journey, so the pointer is the platform's own mark — the same dhow that sits in the chapter header, not a second drawing of one. It is generated from `assets/logo-mark.png` (and its dark twin) by `tools/render-cursor.py`: cropped to the silhouette, fitted into a 32×32 square with a 64×64 companion for dense screens. A 32px square is the size every platform draws reliably.

Two states, one artwork: at rest the mark is carried at 62% alpha so it does not compete with the text; over anything clickable it goes to full strength. The hotspot is the masthead — `11 1`, the topmost stroke of the mast — because that is the highest and sharpest point of the drawing, so the click lands where the eye is aimed.

Plain `url()` is declared first and `image-set()` layered over it: a browser that cannot parse `image-set()` in `cursor` discards that line and keeps the working base. The layering is defensive, not decorative — an earlier version declared only `image-set()`, its 2× file was corrupt, and the cursor vanished entirely rather than falling back. Touch devices never see it: the whole block sits behind `(hover: hover) and (pointer: fine)`.

## Do's and Don'ts

### Do:
- **Do** keep amber for exactly one live action per screen; give every other emphasis to cinnabar, ink, or a rule.
- **Do** separate blocks with a 1px rule plus a cinnabar rubric label — the band idiom (`border-top`/`border-bottom`, `padding: 16px 0`, no fill).
- **Do** put a screen's rubric in the running head, and let the heading be the first thing in the text column.
- **Do** say the state in words as well as colour: a tracked uppercase label plus a 1px marginal stroke accompany every dome or cinnabar verdict.
- **Do** set the text in Literata, the apparatus in Golos Text, and Arabic in Amiri with `dir="rtl"`.
- **Do** keep every rule at 1px and every drawn mark at 1.3 stroke on a 24px box, inheriting `currentColor`.
- **Do** animate on one axis for 320ms with `cubic-bezier(.16,1,.3,1)`, and let what appeared stay.
- **Do** cap the set column at 34em and keep tabular lining figures on every number.
- **Do** honour `prefers-reduced-motion` by removing the entrance and clamping transitions.

### Don't:
- **Don't** introduce a filled panel or a boxed question. The four-sided hairline frame is reserved for the cycle on the contents page and goes nowhere else; inside a chapter, boundary comes from ruling.
- **Don't** exceed 2px radius, and don't use 2px anywhere but form fields.
- **Don't** add a `box-shadow`. There is no elevation vocabulary here to extend.
- **Don't** set anything above a heading in the text column — no kicker, no eyebrow, no label line. The `eyebrow` block type is suppressed in CSS and lifted to the running head on purpose.
- **Don't** replace the 1px gauge with a progress bar, a track, or a percentage.
- **Don't** let a revealed excerpt close, collapse, or disappear on navigation, and don't deliver the source in a modal or an accordion.
- **Don't** use emoji, an icon font, or a Unicode character as an icon; draw it into the `MARKS` SVG set at 1.3 stroke.
- **Don't** fill a surface with cinnabar, dome green, or amber — all three are strokes, letters, and 1px marks on the night ground.
- **Don't** add a second background tone; `{colors.night-raise}` is for hover and select bodies only.
- **Don't** ship a light theme. This world is night-only by agreement, pending a decision after the first pass.
