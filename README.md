# Eryaman Speaking Club — Website & Game Hub

A lightweight, static website and browser-game collection for **Eryaman Speaking Club**. The main site introduces the club and meetup experience; the separate Game Hub contains 12 speaking, conversation and party games that run directly in the browser.

- **Club website:** https://eryaman-speaking-club.github.io/
- **Game Hub:** https://eryaman-speaking-club.github.io/games/

## Purpose

The project has two goals:

1. explain Eryaman Speaking Club, how meetups work, participation options, events and community feedback;
2. provide simple speaking games that can be opened instantly on a phone, tablet, laptop or projector during meetups.

The project is intentionally frontend-only. There is no backend, database, package installation or paid runtime dependency.

## Main features

### Club website

- Turkish landing page for Eryaman Speaking Club
- club introduction, vision and meetup flow
- participation/pricing section
- event photos, videos, statistics, feedback and FAQ
- responsive navigation and mobile layout
- 3 featured games on the homepage: **Taboo**, **Truth or Dare** and **Would You Rather?**
- link to the full 12-game Game Hub

### Game Hub

- 12 playable browser games
- filters for group, quick and conversation games
- random-game selection from the currently visible category
- responsive cards and game previews
- direct links to every game

## Games

| Game | Main gameplay |
| --- | --- |
| **Truth or Dare** | Player wheel, Truth/Dare cards and local content management |
| **One for Me / One for You** | Alternating conversation cards |
| **Last Thing You Did** | Recent-experience prompts with categories, history and shuffle |
| **What Would You Do If?** | Hypothetical scenarios with categories, history and shuffle |
| **Would You Rather?** | Two-option dilemmas with optional group-vote counters |
| **Most Likely To** | 3–2–1 group vote with an optional player roster and pick totals |
| **Hot Seat** | Saved player list, 60-second rounds and answered-question score |
| **5 Second Challenge** | Five-second timer, made/missed totals and optional player turns/scores |
| **Red Flag / Green Flag** | Per-round voting and follow-up discussion |
| **Taboo** | Solo or two-team mode, rotating speakers, timer and team scores |
| **Debate Roulette** | Random FOR/AGAINST side, 10-second preparation and 45-second speech |
| **Never Have I Ever** | Per-round I HAVE / NEVER voting and story prompts |

## Game modes, teams and scoring

Not every game uses the same structure. Team, player, score and turn systems are enabled only where they improve the activity.

### Taboo

Taboo supports both **quick play without teams** and an optional **two-team mode**.

In team mode:

- Team A and Team B can be renamed.
- Each team can have its own player list.
- Turns alternate automatically between teams.
- The active speaker rotates through that team's player list.
- Correct answers increase the current round score.
- Finishing a turn adds that round score to the active team's total.
- **Reset scores** clears team scores and speaker rotation without requiring the admin password.

Team names, player lists and the selected team/quick-play mode are stored locally in the browser.

### Other player/score systems

- **Hot Seat:** saved player list, manual next-player control, 60-second round and answered-question count.
- **5 Second Challenge:** optional player list, automatic turn rotation and per-player scores in addition to made/missed totals.
- **Most Likely To:** optional player list and per-player pick totals.
- **Would You Rather?:** optional visible vote counters.
- **Red Flag / Green Flag** and **Never Have I Ever:** round-based vote totals.
- **Debate Roulette:** 10-second preparation followed by a 45-second speaking round.

Reset controls affect the relevant gameplay state only. Normal player/team setup never requires the admin password.

## Question editor and admin lock

Supported game pages load `esc-content-editor.js`, which detects the game's built-in content source and adds an **Edit questions** control.

Depending on the game schema, the editor can:

- add questions/prompts;
- edit existing content;
- remove content while keeping at least one item;
- search the local question library;
- restore the built-in library.

Edited question libraries are saved only in that browser with `localStorage`.

Opening the editor requires the local admin password. The readable password is not stored in the JavaScript; the entered value is checked against a SHA-256 hash. A successful unlock is remembered for the current browser tab with `sessionStorage`.

This is a lightweight event safeguard, **not server-side authentication** and not suitable for protecting sensitive data.

## Local data

Depending on the game, the browser may locally remember:

- edited question libraries;
- player names;
- team names and mode selection;
- sound-level preference.

Active round state and most scores are gameplay state rather than account data. Data does not sync between devices because the project has no backend. Clearing site storage removes saved local customisations.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- `localStorage` / `sessionStorage`
- Web Audio API for lightweight game sounds
- GitHub Actions
- GitHub Pages

There is no npm dependency, framework or build step.

## Project structure

```text
/
├── index.html                 # Club website
├── home.css                   # Main homepage layout/styles
├── home-extra.css             # Gallery, media and extra homepage sections
├── home-polish.css            # Final homepage visual polish
├── home.js                    # Navigation, animations, counters and homepage behaviour
├── meetup-pricing.css         # Participation/pricing section
├── games/
│   ├── index.html             # Full 12-game Game Hub
│   ├── games.css              # Game Hub layout
│   └── previews.css           # Game preview artwork
├── taboo/                     # Individual game folders
├── truth-or-dare/
├── would-you-rather/
├── ...
├── esc-brand.css              # Shared ESC branding + editor styles
├── esc-game-kit.css           # Shared game UI
├── esc-game-kit.js            # Shared audio/feedback helpers
├── esc-depth-pass.js          # Optional roster/vote/turn/timer enhancements
├── esc-content-editor.js      # Password-protected local content editor
└── .github/workflows/pages.yml# GitHub Pages deployment
```

## Run locally

No installation or build command is required. Start any static web server from the repository root, for example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Using a local web server is preferred over opening the files directly with `file://`, because browser storage and security behaviour can differ.

## Deployment

The site is deployed with **GitHub Pages** through `.github/workflows/pages.yml`.

Every push to `main` triggers the Pages workflow. The repository is uploaded directly as a static Pages artifact; there is no separate build stage.

## Basic release check

Before a larger update:

1. Check the homepage on desktop and narrow mobile widths.
2. Confirm the homepage shows only the 3 featured games.
3. Confirm `/games/` shows all 12 games and its filters/random selector work.
4. Open the affected games and test buttons, timers, scores, turns and resets.
5. Test player/team setup and refresh persistence where applicable.
6. Test question add/edit/remove/reset and an incorrect admin password.
7. Check sound controls and missing assets/console errors.
8. Confirm the GitHub Pages workflow completes successfully.

## Future improvements

Changes that fit the current architecture without a rewrite include:

- automated smoke tests for internal links and game entry pages;
- consistent keyboard/focus handling for every modal;
- optional import/export for locally edited question libraries;
- lightweight offline/PWA support for unreliable event Wi-Fi;
- a shared metadata manifest to reduce duplicated game information.

A backend should only be introduced if the project later needs accounts, cross-device sync, central content administration or secure authentication.
