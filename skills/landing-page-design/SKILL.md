---
name: landing-page-design
description: "Complete system for building high converting landing pages: intake questions, page structure, layout selection, conversion copywriting, SEO, plus strict visual rules for typography, spacing, corner radius, backgrounds, hero layout, icons, and motion. Use this skill whenever building, editing, styling, reviewing, or writing copy for ANY landing page, marketing site, web UI, page section, component, or prototype, even when the user does not mention design, conversion, tokens, or a design system. Always consult it before choosing page sections, headlines, CTAs, fonts, font sizes, spacing values, border radii, background colors, icons, or transitions."
---

# Landing Page Design

A landing page is not a homepage. A homepage serves multiple intents. A landing page wins one intent:

**one offer → one audience → one primary action.**

This skill has two halves. **Part A** decides what the page says and how it is structured. **Part B** is the non negotiable visual system. Work through A before touching B.

## Scope

Apply to all web UI work: landing pages, marketing sites, components, dashboards, prototypes, and design reviews. When a rule here conflicts with a framework default, this file wins. When the user's explicit prompt conflicts with a rule, the user wins.

---

# PART A — Strategy and structure

## A1. Intake

Gather these before designing or writing. Ask only for what is missing, and ask in one batch rather than one question at a time.

**Purpose**
- What is the ONE primary action? (trial, demo, buy, waitlist, download)
- What is the offer, exactly what do they get?
- What counts as a conversion? (click, signup, purchase)

**Audience and context**
- Who is the ICP?
- What problem are they trying to solve?
- Top three objections, meaning why they do not convert today
- Traffic source: ads, search, social, email
- What do visitors already know when they land?

**Proof and assets**
- Proof points: logos, testimonials, numbers, case studies
- Screenshots, demo video, product GIFs
- Guarantees, refund terms, cancellation terms

**Constraints**
- Brand voice: casual or professional
- Design direction: minimal editorial, playful 3D, glass UI
- Mobile priority?

If the user cannot answer, make a reasonable assumption, state it in one line, and continue. Do not stall the build.

## A2. Page structure

**Above the fold (required)**
1. Headline, outcome plus audience
2. Subheadline, clarifies how and adds specificity
3. Primary CTA, clear verb plus what they get
4. One proof signal, logo strip, stat, or short testimonial
5. Hero visual, product screenshot or video, or a strong illustration

**Mid page (the argument)**
6. Problem to solution, one section
7. Benefits, three to five, outcome driven
8. How it works, three steps
9. Social proof, testimonials or a case study

**Bottom (objection handling)**
10. FAQ, six to twelve questions
11. Risk reversal, trial, cancel anytime, guarantee
12. Final CTA, identical to the top

Include the mandatory tagline reveal section from B11 somewhere in the mid page argument, typically right after the hero or after benefits.

## A3. Layout selection

Pick one and say why.

| Type | Use when |
|---|---|
| **A. Classic hero plus sections** | The product is understandable from a hero screenshot. Most common. |
| **B. Long form story** | You need to educate and overcome skepticism. |
| **C. Minimal conversion page** | High intent traffic (email to known users), or a short offer like a download or waitlist. |
| **D. Comparison page** | Search intent includes alternatives ("X vs Y", "best for"). Usually paired with SEO pages. |

## A4. Conversion rules

**Match message to source.** If traffic comes from ads, mirror the ad headline in the hero and keep the same promise and visual tone.

**Make the next step obvious.** One primary CTA. Never place competing CTAs above the fold.

**Write benefit first.** Features are what it does. Benefits are what that means for them.

**Be specific.**
- ❌ "Save time and streamline"
- ✅ "Cut your weekly reporting from 4 hours to 15 minutes"

**Reduce risk.** Pick at least one: free trial, free plan, no credit card, cancel anytime, money back guarantee.

**Treat objections as a section, not a footnote.** Move the FAQ earlier for high friction offers. Put proof directly beside the claim it supports.

## A5. Copywriting

**Headline formulas**
- "{Outcome} without {pain}"
- "The {category} for {audience}"
- "Ship {result} in {time}"

**Subheadline.** One or two sentences. Clarify what it is and who it is for.

**CTA.** Verb plus what they get. Never "Learn more" or "Submit". Use "Start free trial", "Book a demo", "Get the checklist".

**Benefit bullets.** Bold benefit, then the proof or detail. Example: **Faster iteration** — generate three layout variants in one click.

Note: the copy rules in B1 still apply. No hyphens inside sentences, no orphaned words.

## A6. Build order

Work section by section, in this order:

1. Hero
2. Benefits
3. How it works
4. Proof
5. FAQ
6. Final CTA

Never rebuild the whole page on each iteration. Section by section keeps control and keeps diffs reviewable.

## A7. SEO and AEO

**Do not index** ad only campaign pages or highly time bound offers. Use `noindex` or keep them behind a non indexed path.

**Do index** evergreen offers and pages where search intent matches the promise. Add a clear title and meta description, internal links from the homepage and feature pages, and the FAQ in plain question and answer form for AEO. Add FAQ schema if appropriate.

## A8. Pitfalls

- Too many CTAs above the fold
- Vague value prop: "streamline", "optimize"
- A large feature list with no outcomes
- Proof buried at the bottom
- Mobile layout that breaks readability
- No clear next step

---

# PART B — Visual system

Every visual value must resolve through these rules instead of being invented ad hoc.

## B1. Typography

### Fonts

**Use:** Geist, Manrope, Geist Mono, Poppins.

**Never use:** Inter, Roboto, Arial, Open Sans, Helvetica.

**Never use italic fonts** anywhere in the interface.

**One typeface per site.** Do not pair two fonts unless the prompt explicitly asks for it. Geist Mono is allowed alongside a primary font only for code, data, or numeric UI where a monospace is functionally required.

**Never use ultra bold weights** (900 / black). Cap at semibold or bold.

### Copy rules

**No hyphens in text.** Do not use `-` inside body copy, headings, or labels. Rewrite the phrase instead.

**No orphaned words.** A single word must never sit alone on the last line. Apply `text-wrap: balance` for headings and `text-wrap: pretty` for body copy.

### Type scale

Always resolve font sizes to Tailwind's default type scale. Never leave arbitrary values in place, including `text-[19px]`, `font-size: 22px`, or `1.4rem`.

If an existing size does not land exactly on a step, snap it to the **closest step below**, taking both the size and its paired line height.

| Class | Size | Line height |
|---|---|---|
| `text-xs` | 12px (0.75rem) | 16px |
| `text-sm` | 14px (0.875rem) | 20px |
| `text-base` | 16px (1rem) | 24px |
| `text-lg` | 18px (1.125rem) | 28px |
| `text-xl` | 20px (1.25rem) | 28px |
| `text-2xl` | 24px (1.5rem) | 32px |
| `text-3xl` | 30px (1.875rem) | 36px |
| `text-4xl` | 36px (2.25rem) | 40px |
| `text-5xl` | 48px (3rem) | 1 |
| `text-6xl` | 60px (3.75rem) | 1 |
| `text-7xl` | 72px (4.5rem) | 1 |
| `text-8xl` | 96px (6rem) | 1 |
| `text-9xl` | 128px (8rem) | 1 |

### Text styles

Every piece of text uses one of these named styles. Never style text with a loose size and weight. Use the names exactly as written, including capitalization.

| Style | Scale step | Size / line height | Weight |
|---|---|---|---|
| Heading 1 | `text-6xl` | 60 / 60 | Semibold |
| Heading 2 | `text-5xl` | 48 / 48 | Semibold |
| Heading 3 | `text-4xl` | 36 / 40 | Semibold |
| Heading 4 | `text-3xl` | 30 / 36 | Semibold |
| Heading 5 | `text-2xl` | 24 / 32 | Semibold |
| Heading 6 | `text-xl` | 20 / 28 | Semibold |
| Title 1 | `text-xl` | 20 / 28 | Medium |
| Title 2 | `text-lg` | 18 / 28 | Medium |
| Title 3 | `text-base` | 16 / 24 | Medium |
| Title 4 | `text-sm` | 14 / 20 | Medium |
| Title 5 | `text-xs` | 12 / 16 | Medium |
| Body 1 | `text-base` | 16 / 24 | Semibold |
| Body 2 | `text-base` | 16 / 24 | Medium |
| Body 3 | `text-base` | 16 / 24 | Regular |
| Body 4 | `text-sm` | 14 / 20 | Semibold |
| Body 5 | `text-sm` | 14 / 20 | Medium |
| Body 6 | `text-sm` | 14 / 20 | Regular |
| Button-lg | `text-lg` | 18 / 28 | Semibold |
| Button-md | `text-base` | 16 / 24 | Semibold |
| Button-sm | `text-sm` | 14 / 20 | Semibold |
| Button-Xsm | `text-xs` | 12 / 16 | Semibold |
| Caption 1 | `text-sm` | 14 / 20 | Medium |
| Caption 2 | `text-sm` | 14 / 20 | Regular |
| Caption 3 | `text-xs` | 12 / 16 | Semibold |
| Caption 4 | `text-xs` | 12 / 16 | Medium |
| Caption 5 | `text-xs` | 12 / 16 | Regular |

In code, define each style once as a reusable class or token with the same name in kebab case (`heading-1`, `body-4`, `button-md`, `caption-2`) and apply that, instead of repeating size and weight utilities on every element.

## B2. Spacing

Only these values. Nothing between them, nothing outside them.

| Token | Value |
|---|---|
| Spacing-0 | 0 |
| Spacing-25 | 2px |
| Spacing-50 | 4px |
| Spacing-75 | 8px |
| Spacing-100 | 12px |
| Spacing-200 | 16px |
| Spacing-300 | 24px |
| Spacing-400 | 32px |
| Spacing-500 | 40px |
| Spacing-600 | 48px |
| Spacing-700 | 64px |
| Spacing-800 | 80px |
| Spacing-900 | 96px |

**Main buttons:** 8px vertical padding, 12px horizontal padding.

## B3. Corner radius

Only use Tailwind's radius values.
**Nested radius formula:** `inner radius = outer radius − gap` (when gap < 32px and result > 2).

## B4. Borders and backgrounds

- Never apply a border to only one side of a card. Borders go all the way around or not at all.
- Never use gradients in backgrounds. Backgrounds are flat.
- Dark mode background colors: `#000000`, `#181818`, `#1F1F1F`, `#272727`, `#313131`, `#131209`.

## B5. Hero section
Heading text gradient left to right: `#FFFFFF` -> `#9B9B9B`. Max width 680px.

## B6. Icons
Phosphor, Solar, or Iconamoon only.

## B7. Motion
Base curve: `ease-[cubic-bezier(0.22,1,0.36,1)]`. `duration-500` for layout/pos, `duration-300` for hover/opacity. Animate only `transform` and `opacity`.

## B8. Content realism
Believable names and numbers, no banned words, sentence case, calm system messages.

## B9. States
Hover, active (`scale-[0.98]` or 1px translate), visible focus ring, skeleton loaders, composed empty views, specific inline errors.

## B10. Ship requirements
Branded 404, favicon, meta tags, alt text, 390px mobile verification.

## B11. Tagline reveal section (mandatory)
Minimum two lines. Muted text brightening word by word on scroll with IntersectionObserver. Reduced motion shows full color immediately.
