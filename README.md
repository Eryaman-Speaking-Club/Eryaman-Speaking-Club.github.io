# Eryaman Speaking Club — Game Hub

A lightweight browser-based game hub built for **Eryaman Speaking Club**. The project brings conversation, speaking, party and quick-response games into one simple place that works on phones, tablets and desktop browsers.

**Live site:** https://eryaman-speaking-club.github.io/

## About the project

The goal is simple: make it easier for a group to start talking, keep conversations moving and add a little competition without turning the session into a complicated board game.

The hub currently contains **12 games**. Some are pure conversation games, while others use players, timers, voting, teams, scores or random selection.

## Games

| Game | What it does |
| --- | --- |
| **Truth or Dare** | Player wheel, random selection, Truth/Dare flow and group play. |
| **One for Me / One for You** | Alternating conversation cards for two-way or group discussion. |
| **Last Thing You Did** | Fast prompts based on recent experiences and stories. |
| **What Would You Do If?** | Hypothetical situations designed to create discussion and creative answers. |
| **Would You Rather?** | Two-option dilemmas with discussion and group-vote support. |
| **Most Likely To** | Group pointing/voting game with an optional player list. |
| **Hot Seat** | Named players, 60-second rounds, rapid questions and answer scoring. |
| **5 Second Challenge** | Five-second challenges with optional player rotation and scoring. |
| **Red Flag / Green Flag** | Quick judgments with round-based group voting and counterarguments. |
| **Taboo** | Timed word-description game with optional two-team mode, player rotation and team scores. |
| **Debate Roulette** | Random FOR/AGAINST positions with preparation and speaking timers. |
| **Never Have I Ever** | Story prompts with round-based group voting. |

## Shared features

- Responsive layout for mobile and desktop
- Consistent Eryaman Speaking Club branding
- Shared sound controls and game feedback sounds
- Category filters where they make sense
- Shuffled decks and repeat reduction
- Local player/team setup for supported games
- Local question editor for adding, editing or removing game content
- Admin-password protection for question editing
- No password required for normal player or team setup
- No backend, database, API key or paid runtime service

## Question editor

Most game pages include an **Edit questions** control. The editor can add, edit or remove prompts and saves changes in the current browser using `localStorage`.

The editor is protected by the same local admin lock used by the original ESC games. Because this is a static frontend-only project, the lock is intended to prevent casual changes during an event; it is not server-side authentication.

Player names, teams, scores or other game setup options do **not** require the admin password.

## Local data

The site is intentionally backend-free. Depending on the game, the browser may locally remember:

- edited question libraries
- player names
- team names
- selected setup options
- sound preferences

This data stays in that browser/device unless the browser storage is cleared.

## Hosting

The project is hosted with **GitHub Pages** and deployed automatically from the `main` branch through GitHub Actions.

The site is fully static, so there is no application server or paid hosting runtime required for normal use.

## Design principle

Keep the games **simple enough to start in seconds**, but give each one enough structure—timers, turns, voting, players, teams or scores—to feel like a real group activity rather than a plain list of questions.
