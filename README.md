# Eryaman Speaking Club — Website & Game Hub

A free public website and browser-based game collection for **Eryaman Speaking Club**. The main page is the Turkish club website; the separate Game Hub contains 12 speaking, conversation and party games that run directly in the browser.

**Club website:** https://eryaman-speaking-club.github.io/

**Game Hub:** https://eryaman-speaking-club.github.io/games/

## Project purpose

The project has two roles:

1. introduce Eryaman Speaking Club, its vision, meetup format, event media and participant feedback;
2. provide simple speaking games that can be opened instantly on phones, tablets, laptops or a projector during meetups.

The project is intentionally static and lightweight. There is no backend, database, package installation or paid runtime dependency.

## Main website

The homepage is Turkish and includes:

- club introduction and vision;
- meetup flow and participation guidance;
- interactive Game Hub preview;
- group-focused event photo filmstrip;
- selected event video embeds;
- club statistics;
- anonymised and edited participant-feedback summaries;
- FAQ and social-media calls to action.

Event photos and videos are embedded from the club's Google Drive event archive. Those Drive files must remain viewable by site visitors for the media embeds to work.

## Core features

- Responsive layouts for phone, tablet and desktop.
- Shared Eryaman Speaking Club visual identity across the site and games.
- 12 browser games with category filters where relevant.
- Game Hub filters for group, quick and conversation games.
- Random-game selection from the currently visible Game Hub category.
- Shared sound controls and lightweight audio feedback.
- Shuffled decks and reduced immediate repetition in supported games.
- Optional player lists, teams, turns, timers, scores or voting where the game needs them.
- Local question editing without a backend.
- GitHub Pages deployment directly from `main`.

## Games

| Game | Main gameplay |
| --- | --- |
| **Truth or Dare** | Player wheel, fair rotation, Truth/Dare cards and local content management |
| **One for Me / One for You** | Alternating conversation cards with local card management |
| **Last Thing You Did** | Recent-experience prompts with categories, history and shuffle |
| **What Would You Do If?** | Hypothetical scenarios with categories, history and shuffle |
| **Would You Rather?** | Two-option dilemmas, keyboard controls and optional group-vote counters |
| **Most Likely To** | 3–2–1 group vote, optional player list and per-player pick totals |
| **Hot Seat** | Saved player list, 60-second rounds and answered-question score |
| **5 Second Challenge** | Five-second timer, made/missed totals, optional turns and player scores |
| **Red Flag / Green Flag** | Per-round group voting and follow-up discussion |
| **Taboo** | Solo or two-team mode, rotating speakers, timer and team scores |
| **Debate Roulette** | Random FOR/AGAINST side, 10-second preparation and 45-second speech |
| **Never Have I Ever** | Per-round I HAVE/NEVER voting and story prompts |

## Player, team, score and reset behaviour

Not every game needs the same amount of structure, so these systems are enabled only where they improve the activity.

- **Taboo** can run without teams or with two teams. Team names and player lists can be saved locally, turns alternate between teams, speakers rotate and each completed team turn contributes to that team's score.
- **5 Second Challenge** can use an optional player roster, automatic turn rotation and per-player scores in addition to the round made/missed totals.
- **Most Likely To** can use an optional player roster and record how often each player is selected.
- Other games use round totals, votes, timers or simple next/back history where appropriate.
- Reset controls clear the relevant in-memory score/turn state without requiring an admin password. Saved setup data is kept or cleared according to the game control being used.

## Question editor and admin lock

Simple game pages can load `esc-content-editor.js`, which detects the page's built-in question source and provides an **Edit questions** control.

The editor supports, depending on the game schema:

- adding prompts;
- editing existing prompts;
- removing prompts while keeping at least one item;
- searching the local library;
- restoring the built-in question library.

Custom question libraries are stored only in that browser using `localStorage`.

Opening the editor requires the local admin password. The password itself is not stored as readable text in the JavaScript; the entered value is checked against a SHA-256 hash. A successful unlock is remembered only for the current browser tab with `sessionStorage`.

This is intentionally a lightweight event safeguard, **not server-side authentication**. It prevents casual editing during an event but must not be treated as protection for sensitive data.

Normal player/team setup does not require the admin password.

## Local data

Depending on the game, the browser can locally remember:

- edited question libraries;
- player names;
- team names and setup choices;
- sound level preferences.

Scores and active-round state are generally session/gameplay state rather than permanent account data.

Because there is no backend, data does not automatically sync between devices. Clearing browser/site storage removes saved local customisations.

## Project structure

- `index.html` — Turkish club website markup.
- `home.css` — main club-site layout, branding and responsive styles.
- `home-extra.css` — enhanced event gallery, video, game-preview and participant-feedback styling.
- `home.js` — navigation, gallery controls, reveal animation, rotating hero copy, counters and FAQ behaviour.
- `games/index.html` — Turkish Game Hub landing page, filters and random-game selection.
- `games/games.css` — responsive Game Hub presentation.
- each game folder — one playable game entry point.
- `esc-brand.css` — shared ESC logo/brand styling and local question-editor styling.
- `esc-game-kit.css` / `esc-game-kit.js` — shared game UI, sound level and audio-feedback helpers.
- `esc-depth-pass.js` — optional voting, roster, turn and timer enhancements for selected games.
- `esc-content-editor.js` — local question editor used by supported game pages.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.

## Run locally

No package installation or build command is required.

From the repository root, start any static web server. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Opening pages directly with `file://` is not recommended because browser security and storage behaviour can differ from the deployed site.

## Deployment

GitHub Actions deploys the repository to GitHub Pages whenever `main` is updated. The workflow is `.github/workflows/pages.yml`.

There is no separate build step: the repository itself is uploaded as a static Pages artifact and deployed.

## Maintenance checklist

Before publishing a major change:

1. Open the Turkish homepage at desktop and narrow mobile widths.
2. Confirm Drive group photos and selected video previews load for a visitor account.
3. Open the Game Hub, test all filters and try random-game selection.
4. Open all 12 games and verify navigation back to the hub/site.
5. Test relevant timers, scores, votes, player lists and team dialogs.
6. Verify local setup/question persistence after a refresh where persistence is expected.
7. Confirm question add/edit/remove/reset and wrong-password behaviour.
8. Check sound controls at 0%, mid-range and 100%.
9. Check the browser console for JavaScript errors and missing assets.
10. Confirm the GitHub Pages workflow completes successfully.

## Future improvements

Useful next steps that fit the current architecture without requiring a rewrite include:

- add lightweight automated smoke tests for internal links and game entry pages;
- add accessible keyboard/focus handling to every modal/dialog consistently;
- improve offline/PWA support for events with unreliable Wi-Fi;
- add optional import/export for locally edited question libraries;
- add a simple content manifest so shared game metadata is not duplicated between the homepage, Game Hub and README;
- optimise event-media delivery if the Drive gallery grows significantly.

A backend should only be introduced if the project later needs shared accounts, cross-device synchronisation, central content administration or genuinely secure authentication.

## Project principle

The club website should feel social, clear and real. The games should remain understandable in seconds, comfortable on mobile and structured only as much as the activity needs.
