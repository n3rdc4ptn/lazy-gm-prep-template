# TTRPG Prep PDF Templates for reMarkable Paper Pro & Paper Pro Move

A collection of printable PDF templates for tabletop RPG session prep, laid out for the exact screen dimensions of the reMarkable Paper Pro and reMarkable Paper Pro Move.

## Available Templates

| Template | System | Device | Languages |
|---|---|---|---|
| Lazy GM Session Prep | system-agnostic | Paper Pro | EN, DE |

More templates (Daggerheart environments, adversaries, and others) are on the way.

## How to use

Install dependencies:

```bash
bun install
```

Run the development server for live preview of the Lazy GM template (English):

```bash
bun dev
```

Render PDFs:

```bash
# Lazy GM (English, Paper Pro)
bun run render:lazy-gm

# Lazy GM (German, Paper Pro)
bun run render:lazy-gm:de

# Generic: render any template by passing its HTML path
bun run render templates/system-agnostic/lazy-gm-session-prep/paper-pro/en.html
```

Output PDFs are written to `output/` and named `<template>.<device>.<lang>.pdf`.

## Adding a new template

1. Create a folder under `templates/<system>/<template-name>/<device>/`. `<system>` is `system-agnostic` or the name of a specific RPG (e.g. `daggerheart`). `<device>` is `paper-pro` or `paper-pro-move`.
2. Add one HTML file per language: `en.html`, `de.html`, etc.
3. In each HTML file, link the shared stylesheets:
   ```html
   <link rel="stylesheet" href="../../../../shared/base.css">
   <link rel="stylesheet" href="../../../../shared/paper-pro.css">
   ```
   Replace `paper-pro.css` with `paper-pro-move.css` for Move templates.
4. Render with `bun run render templates/<system>/<template-name>/<device>/<lang>.html`.

Page size is driven by the device CSS — `shared/paper-pro.css` (179.7mm × 239.6mm) and `shared/paper-pro-move.css` (91.8mm × 163.2mm). To add a new device, drop a new CSS file in `shared/` with the `@page` rule and reference it from your template.

## Contribution

I'm happy to collaborate on this project — please open issues or PRs.

## License

Template code © Moritz Marby
Licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

This work includes material taken from the [Lazy GM's Resource Document](https://slyflourish.com/lazy_gm_resource_document.html) by Michael E. Shea of [SlyFlourish.com](https://slyflourish.com/), available under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
