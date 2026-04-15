# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the site configuration for **Falch & Bai**, a Copenhagen-based real estate agency. The config is consumed by a proprietary backend platform (namespace: `dk.realequity.application.homepage`) that renders pages at runtime — there is no build step.

## Repository Structure

Two parallel ways to navigate the config:

1. **`templates.json`** — The single 10,000+ line file that the platform actually reads. All edits that go live must ultimately be reflected here.
2. **Modular section files** — Individual JSON files organized by page directory (e.g., `frontpage/02_hero.json`). These serve as the canonical source for editing individual sections; they are the files you should read and edit. Named `{NN}_{description}.json` where `NN` is the display order within the page.

Page directories: `frontpage/`, `casedetails/`, `saelg-din-bolig/`, `koeberkatotek/`, `diskretsalg/`, `bolig-viden/`, `kontakt-os/`, `soeg-efter-bolig/`, `solgt_udlejet/`, `vores-omraader/`, `omraade-valby/`, `omraade-gentofte/`, `omraade-koebenhavn_k/`, `notfound/`, `privatlivspolitik/`, `Persondatapolitik/`, plus `footer.json`.

## Section File Format

Each section file is a JSON object with:

```json
{
  "metadata": { "id": "...", "title": "...", "description": "...", "searchString": "...", "tags": [] },
  "type": "DynamicSectionComponent",
  "title": "...",
  "priority": "0",
  "specifics": { "rootComponent": { ... } },
  "ui": { "width": "xl", "bgColor": "#11352f", "padding": "none", "margin": "none" },
  "id": "section_<uuid>"
}
```

- **`priority`** controls section order within a page (string "0", "1", …)
- **`ui`** controls outer section appearance (background, width, padding)
- **`specifics.rootComponent`** is the content tree

## Component Tree

Content is built from nested components inside `specifics.rootComponent`:

| Component | Purpose |
|---|---|
| `FlowComponent` | Layout container — `direction`, `gap`, `padding`, `align`, `width` |
| `TypographyComponent` | Text with `text` (HTML), `textColor`, `size`, `fontFamily` |
| `HtmlComponent` | Raw HTML/CSS/JS injection via `config.html` |
| `WishForm` | Platform's buyer registration form |
| `CaseList`, `CaseTileGallerySection` | Property listing components |
| `CaseContactSection`, `CaseMapSection`, etc. | Case detail page blocks |

### Responsive Values

A `|` separator means `mobile | desktop`:
```
"gap": "lg | xl"      → gap: lg on mobile, xl on desktop
"width": "100% | 50%" → full width mobile, half on desktop
"padding": "md | xl"
```

## Brand & Styling

- **Client:** Falch & Bai (`jb@falchbai.dk`, `+45 22 29 60 91`, Herluf Trolles Gade 4, 1052 København K, CVR: 45353818)
- **Primary blue:** `#030860` — buttons, theme color
- **Accent gold:** `#c19a5b` — headers, links, highlights
- **Footer bg:** `#11352f` (dark green)
- **Off-white:** `#fafafa`, **Light gray:** `#f2f2f2`
- **Fonts:** Playfair Display (serif headings), DM Sans (body)
- **Custom nav/CSS/JS:** Sourced from [`https://github.com/casperudesen/global-styles`](https://github.com/casperudesen/global-styles) and loaded via jsDelivr CDN (`https://cdn.jsdelivr.net/gh/casperudesen/global-styles@main/a.css`) in each page's `01_navigation.json` via `HtmlComponent`. To understand or modify nav/styling behavior, check that repo — changes there affect all pages simultaneously.

## Navigation & Global Styles Architecture

All nav/CSS/JS is driven by **GTM**, not by the `01_navigation.json` files.

### GTM tag: "FB - Global Bootstrapper (Nav & Styles)"
Single tag that fires on all pages. Controls everything:
- Injects critical CSS into `<head>` (hides platform nav, resets `--heightMobile` vars)
- Loads `a.css` from jsDelivr CDN
- Fetches and injects `nav.html`, appended to `<html>` (outside React's component tree)
- Hooks History API for SPA route changes
- Uses `MutationObserver` + `setInterval` to re-inject nav if React removes it
- Guards against double-mount with `window.fbNavSystemLoaded`

**Version:** controlled by `var VERSION = "v1.0.5"` at the top of the GTM tag. Bump this when deploying CDN changes. CDN base: `https://cdn.jsdelivr.net/gh/casperudesen/global-styles@main`.

**Rollback:** use GTM → Versions tab to revert to a previous published container version.

### `01_navigation.json` files (all pages)
Now contain **only a minimal inline guard CSS** (`<style id="fb-nav-guard">`). This fires synchronously during React render to hide the platform's default header before GTM loads — preventing a flash. No JS, no CDN link tags.

### `saelg-din-bolig/02_navigation.json`
Contains global CSS custom properties and utility classes (brand colors, fonts, button styles, hero/form overrides). Not a nav file — leave as-is.

### `tagmanager.json`
Exported GTM container for `www.falchbai.dk` (container ID `GTM-5JM9ZBJ6`, account `6326900709`). Edit to add/modify tags, triggers, variables, then re-import via GTM admin UI. The container ID is also referenced in `templates.json` under `googleTagManagerId`.

## Key Configuration Values (in `templates.json`)

- **`isProduction: true`** — edits go live immediately
- **`googleTagManagerId`** — GTM-5JM9ZBJ6
- **Features enabled:** `showAgents: true`
- **Features disabled:** `leadHubEstateEnabled: false`, `mindworkingSocialAdsEnabled: false`
- **Content language:** Danish

## Working with This Repo

- To find a section: Grep for its `metadata.id`, `slug`, or descriptive text in the modular files
- UUIDs in `id` fields must be unique — do not duplicate them
- After editing a modular section file, the same change must be applied to `templates.json` (find the matching section by its `id`)
- `position` values on pages in `templates.json` control the site menu ordering
