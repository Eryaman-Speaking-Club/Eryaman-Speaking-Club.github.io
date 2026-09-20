# Eryaman Speaking Club — Website & Game Hub

A lightweight, static website and browser-game collection for **Eryaman Speaking Club**. The main site introduces the club and meetup experience; the separate Game Hub contains 12 speaking, conversation and party games that run directly in the browser.

## Quick links

- **Club website:** https://eryamanspeakingclub.com/
- **Game Hub:** https://eryamanspeakingclub.com/games/
- **ESC Studio:** https://eryamanspeakingclub.com/esc-studio/

> ESC Studio is the private game-management entry point. It is intentionally not linked from the public website or Game Hub.

## Purpose

The project has two goals:

1. explain Eryaman Speaking Club, how meetups work, participation options, events and community feedback;
2. provide simple speaking games that can be opened instantly on a phone, tablet, laptop or projector during meetups.

The public site is deployed as a lightweight GitHub Pages project. **ESC Studio** is the single management entry point, while Supabase now provides the central database and admin authentication layer.

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

## ESC Studio and game administration

Game administration is centralized at:

`https://eryamanspeakingclub.com/esc-studio/`

Public game pages no longer expose the question/admin controls. Supported game pages still load `esc-content-editor.js`, but the editor UI is mounted only when the game is opened from ESC Studio in Studio mode.

Depending on the game schema, the editor can:

- add questions/prompts;
- edit existing content;
- remove content while keeping at least one item;
- search the local question library;
- restore the built-in library.

Generic game libraries now load from and save to Supabase. Truth or Dare and One for Me · One for You also synchronize their centrally managed question/configuration data with Supabase. `localStorage` remains as a fallback/offline copy for resilience.

ESC Studio sign-in uses Supabase Auth. Database writes are protected by Row Level Security and the `esc_admins` allow-list.

## Local data

Depending on the game, the browser may locally remember:

- edited question libraries;
- player names;
- team names and mode selection;
- sound-level preference.

Active round state, player rosters and most scores remain device-local gameplay state. Published question libraries and centrally managed game settings are stored in Supabase; browser storage is retained only as a fallback/offline layer.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- `localStorage` / `sessionStorage`
- Web Audio API for lightweight game sounds
- GitHub Actions
- GitHub Pages
- Supabase PostgreSQL + Auth + RLS for central content management

There is no npm build step or frontend framework.

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
├── esc-studio/
│   ├── index.html             # Private game-management entry point
│   ├── studio.css
│   └── studio.js
├── taboo/                     # Individual game folders
├── truth-or-dare/
├── would-you-rather/
├── ...
├── esc-brand.css              # Shared ESC branding + editor styles
├── esc-game-kit.css           # Shared game UI
├── esc-game-kit.js            # Shared audio/feedback helpers
├── esc-depth-pass.js          # Optional roster/vote/turn/timer enhancements
├── esc-content-editor.js      # Studio-only content editor for supported games
├── esc-supabase-config.js     # Public Supabase URL/publishable-key config
├── esc-supabase.js            # Browser Supabase adapter
├── supabase/
│   ├── schema.sql             # Tables, RLS policies, helper functions and game seeds
│   └── README.md              # Backend setup notes
└── .github/workflows/pages.yml# GitHub Pages deployment
```

## Supabase backend rollout

The repository now contains the backend groundwork in `supabase/schema.sql` and the browser adapter in `esc-supabase.js`.

The target architecture is:

1. GitHub Pages continues serving the public website and games.
2. Supabase Auth handles ESC Studio admin sign-in.
3. Supabase PostgreSQL stores the shared game library and settings.
4. RLS allows public visitors to read active game content.
5. Only users listed in `esc_admins` can write through ESC Studio.
6. The browser uses only the public project URL and anon/publishable key. The `service_role` key must never be committed to this repository.

The Supabase project is connected, the schema/RLS policies are applied, current game libraries are seeded, and editors are wired for central persistence. The remaining bootstrap step is to create the first ESC Studio Auth user and claim the ESC admin role.

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

The active backend migration is intended to provide cross-device sync, central content administration and secure admin authentication while keeping the public site on GitHub Pages.
