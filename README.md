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
- Game Hub preview;
- event photo filmstrip;
- selected event video embeds;
- club statistics;
- anonymised and edited participant-feedback summaries;
- FAQ and social-media calls to action.

Event photos and videos are embedded from the club's Google Drive event archive. Those Drive files must remain viewable by site visitors for the media embeds to work.

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

## Project structure

- `index.html` — Turkish club website markup.
- `home.css` — main club-site layout, branding and responsive styles.
- `home-extra.css` — event gallery, video and participant-feedback sections.
- `home.js` — navigation, reveal animation, rotating hero copy, counters and FAQ behaviour.
- `games/index.html` — Turkish Game Hub landing page.
- `games/games.css` — Game Hub layout and cards.
- each game folder — one playable game entry point.
- `esc-brand.css` — shared ESC logo/brand styling and local question-editor styling.
- `esc-game-kit.css` / `esc-game-kit.js` — shared game UI and sound helpers.
- `esc-depth-pass.js` — optional voting, roster, turn and timer features for selected games.
- `esc-content-editor.js` — local question editor used by simple game pages.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.

## Local editing and storage

Question changes, player lists, team configuration and sound preferences are stored in the browser with `localStorage`. Admin unlocks last only for the current tab session through `sessionStorage`.

This means changes made on one device do not automatically appear on another device, clearing browser/site data removes local customisations, and no game data is sent to a server.

The editor password is a lightweight event safeguard, not secure server-side authentication. Do not store private or sensitive information in the games.

## Run locally

From the repository root, start any static web server. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening files directly with `file://` is not recommended because browser security behaviour can differ from the deployed site.

## Deployment

GitHub Actions deploys the repository to GitHub Pages whenever `main` is updated. The workflow is `.github/workflows/pages.yml`. There is no separate build step: the repository is uploaded as a static site.

## Maintenance checklist

Before publishing a major change:

1. Open the Turkish homepage at desktop and narrow mobile widths.
2. Confirm Drive photos and video previews load for a visitor account.
3. Open the Game Hub and all 12 games.
4. Test game navigation, timers, scores, category filters and player/team dialogs.
5. Verify local persistence after a refresh.
6. Confirm question editing, reset-to-built-ins and wrong-password behaviour.
7. Check the browser console for JavaScript or missing-file errors.
8. Confirm the GitHub Pages workflow completes successfully.

## Project principle

The club website should feel social, clear and real. The games should remain understandable in seconds, comfortable on mobile and structured only as much as the activity needs.
