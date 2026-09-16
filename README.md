# Eryaman Speaking Club — Game Hub

A free, browser-based collection of speaking and party games for **Eryaman Speaking Club**. It is designed for quick group play on phones, tablets and desktop browsers.

**Live site:** https://eryaman-speaking-club.github.io/

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

## How it works

- Static HTML, CSS and JavaScript; there is no framework, package installation or build step.
- `index.html` is the game hub. Each game has its own folder and `index.html` entry point.
- Shared branding and game UI live in `esc-brand.css`, `esc-game-kit.css` and `esc-game-kit.js`.
- `esc-depth-pass.js` adds optional voting, roster, turn and timer features to selected games.
- `esc-content-editor.js` provides the shared local question editor for the simple game pages.
- Truth or Dare and One for Me / One for You have their own editors and storage logic.

## Local editing and storage

Question changes, player lists, team configuration and sound preferences are stored in the browser with `localStorage`. Admin unlocks last only for the current tab session through `sessionStorage`.

This means:

- changes made on one device do not automatically appear on another device;
- clearing browser/site data removes local customisations;
- an incognito/private window has separate temporary data;
- no game data is sent to a server.

The editor password is a lightweight event safeguard, not secure authentication. The site is frontend-only, so anyone with repository/source access can inspect the client code. Do not store private or sensitive information in the games.

## Run locally

From the repository root, start any static web server. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Opening files directly with `file://` is not recommended because browser security rules can differ from the deployed site.

## Deployment

GitHub Actions deploys the repository to GitHub Pages whenever `main` is updated. The workflow is `.github/workflows/pages.yml`. There is no paid application server or runtime dependency.

## Maintenance checklist

Before publishing a change:

1. Open the hub and all 12 games.
2. Test at desktop width and a narrow mobile width.
3. Check Next/Back/Shuffle, category filters, timers and score controls.
4. Verify player/team dialogs and local persistence after a refresh.
5. Confirm question editing, reset-to-built-ins and wrong-password behaviour.
6. Check the browser console for JavaScript or missing-file errors.
7. Confirm the GitHub Pages workflow completes successfully.

## Project principle

Every game should be understandable in seconds, work comfortably on a phone and add only the structure the activity needs: prompts, turns, voting, players, teams, timers or scores.
