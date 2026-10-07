# Reviewed speaking practice levels

This change gives all 32 games separate A1, A2, B1, B2 and C1 practice banks. They are authored teaching materials, not officially calibrated CEFR test questions. A1 uses familiar concrete language; A2 adds everyday details; B1 develops connected accounts; B2 compares alternatives and supports views; C1 qualifies positions and considers counterarguments. Reference: Council of Europe CEFR Global Scale, https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale.

## Build and preview

Run `python3 tools/build_cefr.py` before `python3 -m http.server`. GitHub Pages does this before upload. The guarded, idempotent build integrates the banks with the existing game engines, rather than maintaining 32 duplicated applications. A changed upstream anchor causes the build to fail instead of silently producing a partially upgraded site. The original source HTML is transformed in the deployment artifact; use the build when previewing a checkout.

## Content quality

The source is in `cefr-source.js` and `cefr-bank.js`. No template/topic Cartesian product and no 1,000-item target is used. Every card has an explicit level-specific source. Some related games deliberately share suitable questions or vocabulary; totals are game-level card placements, not a claim of global uniqueness. Emoji Story shares pictures across levels but changes the expected language task. Taboo has one forbidden word at A1, two at A2, three at B1 and four at B2/C1. Complex game instructions are simplified for beginners. Timers remain optional where the existing game allows them.

Old mixed local/cloud pools are preserved, not deleted, but are not playable in a graded session. Existing player names, team scores, audio controls and presentation controls remain in their original engines. A level switch stops relevant timers and clears question history. In-flight card animations cannot restore the old level.

## Editing

Administration displays actual per-level counts and links to `/<game>/?studio=1&level=A1` (or another level). The editor requires the existing Supabase administrator check and row-level security. The friendly card form also offers an advanced JSON view. Data is saved in the existing `game_settings.config.cefr` object as `{version:1,levels:{A1:...,A2:...}}`. Save reads the latest config, retains unrelated properties/other levels, writes through the existing API, and reads back to verify. Old question data remains available for review outside graded play. No auth or database permission changes are introduced.

## Tests

`node tests/cefr-check.cjs` validates all 160 banks, shapes, duplicates, counts, taboo restrictions, bootstrap paths and JavaScript syntax. `tests/cefr-browser.cjs` uses Chromium to test actual pages, level changes, repeated navigation, support dialogs, editor writes to a mocked backend, mobile screenshots, animation races, Taboo passes and Hub links. These mocked-backend tests do not certify live credentials or live database availability; GitHub Pages deployment status is checked separately.
