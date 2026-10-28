# Eryaman Speaking Club — Website & Game Hub

The website, Game Hub, private-lesson student dashboard and education tools for **Eryaman Speaking Club**. The public site introduces the club and meetup experience; the Game Hub contains **32 browser-based speaking and conversation games**; the Educators area adds teacher accounts, classes and classroom tools; and a Supabase-backed management panel controls the live site.

## Live links & access

| Area | URL | Who uses it | Access |
| --- | --- | --- | --- |
| **Club website** | https://eryamanspeakingclub.com/ | Everyone | Public |
| **Turkish homepage** | https://eryamanspeakingclub.com/tr/ | Everyone | Public |
| **English homepage** | https://eryamanspeakingclub.com/en/ | Everyone | Public |
| **Game Hub** | https://eryamanspeakingclub.com/games/ | Members, hosts, teachers | Public |
| **Educators** | https://eryamanspeakingclub.com/educators/ | English teachers / schools | Teacher account |
| **Join a class** | https://eryamanspeakingclub.com/join/ | Students | Class code + first name |
| **Private lessons** | https://eryamanspeakingclub.com/ozel-dersler/ | Prospective students | Public |
| **Private-lesson student panel** | https://eryamanspeakingclub.com/ozel-dersler/ogrenci/ | Private-lesson students | Individual Supabase Auth account |
| **Private-lesson calendar management** | https://eryamanspeakingclub.com/ozel-dersler/yonetim/ | Gülsüm Yağmur Akdeniz / ESC admins | Authorized ESC manager account |
| **Site management panel** | https://eryamanspeakingclub.com/admin/ | Site administrators | Supabase Auth + admin allow-list |
| **Legacy Studio URL** | https://eryamanspeakingclub.com/esc-studio/ | Administrators | Redirects to the central admin panel |

### Administrator sign-in

Use the central management panel:

1. Open **https://eryamanspeakingclub.com/admin/**
2. Sign in with the administrator e-mail: **eryamanspeakingclub@gmail.com**
3. Enter the current Supabase Auth password.
4. If the password is unknown or needs to be changed, use **Şifremi sıfırla** on the login screen.
5. After signing in, the password can also be changed from **Ayarlar → Güvenlik**.

> **Important:** the administrator password is intentionally **not stored in this public README or repository**. Passwords must stay in Supabase Auth / a private password manager. Never commit the password, recovery link, Supabase service-role key, or any other secret to GitHub.

### Teacher access

Teachers use **https://eryamanspeakingclub.com/educators/**.

- Existing teachers choose **Öğretmen girişi** and sign in with their own e-mail/password.
- New teachers can use **Hesap oluştur**.
- Teacher accounts store classes, student codes and lesson data in Supabase.
- Each teacher should use their own account rather than sharing the site administrator account.

### Classroom-game student access (separate from private lessons)

Students do **not** need an e-mail address or account for **normal classroom entry using a class code**.

1. Open **https://eryamanspeakingclub.com/join/**
2. Enter the class code shown by the teacher.
3. Enter a first name.
4. Join the active class.

The class-code join flow is separate from administrator, teacher and **private-lesson student** authentication.

### Private-lesson student panel and teacher calendar (October 2026)

- **Public teacher page:** https://eryamanspeakingclub.com/ozel-dersler/
- **Student account, login and dashboard:** https://eryamanspeakingclub.com/ozel-dersler/ogrenci/
- **Teacher/admin weekly availability:** https://eryamanspeakingclub.com/ozel-dersler/yonetim/

**Student workflow:** create an individual e-mail/password account, choose **who will attend the lesson** (self / child / family member / another person), enter the **learner's name and age group**, select **English level and learning purpose**, add an optional detailed goal, and consent to the process. For learners under 18, only a parent/legal guardian can submit the profile and must explicitly confirm guardianship. Confirm the e-mail if required, browse Yağmur's actual weekly availability, choose **1–12 lessons in one atomic transaction** across multiple weeks, optionally copy selected available hours into later weeks with **Seçili saatleri sonraki haftalara da ekle**, and track pending, confirmed, completed or cancelled lessons in **Derslerim**. Confirmed lessons show the teacher's Google Meet link directly in the student dashboard; students can cancel future *pending* requests. Requests do not become confirmed lessons until the teacher approves them.

**Teacher workflow:** use the existing authorized ESC manager account to enable/disable weekly hours, close individual dates, view student requests and approve them by attaching a valid Google Meet link. Multi-lesson requests use the same `esc_lesson_bookings` table, so students and the teacher see the same reservations. Existing no-account single-lesson inquiries and the general contact form on the public page remain available.

**Student header logo (28 October 2026):** the student dashboard now displays the existing `/esc-center-symbol.svg` brand mark at full size in a clean circular container. Removed the extra navy square behind the circular artwork; adjusted logo/text alignment, typography, and responsive header wrapping so the brand is legible on desktop and mobile. No changes to the ESC artwork or login functionality.

**Student registration UI (28 October 2026):** The enrollment and student-profile screens now use responsive, keyboard-accessible selection cards instead of small native dropdowns for **who the lesson is for**, **learner age**, **English level** and **lesson purpose**. Selections remain mapped to the existing `lesson_for`, `learner_age_group`, `level` and `goal` fields, with no database schema changes. The UI does **not** alter a learner's stated age silently. For `Kendim için` (self), 6–12 and 13–17 are disabled with a contextual explanation; a user who wants lessons for a minor must register under a parent/legal guardian account and provide guardian consent. Inline validation directs the user to the missing or conflicting field. This applies to both new-account registration and existing-account profile completion.

**Existing-account onboarding:** a user who previously created a Supabase account for another ESC feature must still complete the private-lesson enrollment form before accessing booking, even if already logged in. The account is reused; no duplicate Auth user is created. The learner details are stored in `esc_lesson_student_profiles` with `onboarding_completed`, and teacher bookings record both the learner and account holder.

**Student panel enhancements to consider (not implemented yet):** (1) rescheduling requests with an approval cutoff; (2) recurring lesson packages and balance tracking; (3) a student's 50-minute lesson plan, homework and shared files; (4) automated emails plus opt-in reminders once the sender is activated; (5) a lesson-progress view with teacher feedback; (6) timezone and Google Calendar invite support. Introduce these in stages to avoid complicating the initial booking flow.

**Latest private-lesson update (27 October 2026):** Every one-to-one lesson is **50 minutes**, not 60. The existing start times remain hourly (for example, 14:00–14:50, then ten minutes' break). Database booking records default to and validate exactly `duration_minutes=50`, and teacher/guest/student interfaces and queued lesson confirmation templates use 50 minutes.

**Alternative lesson time requests:** students who have completed enrollment can request an unavailable date/hour from the student dashboard, even when the weekly availability calendar contains no slots. Requests are stored in `esc_lesson_time_requests`, carry the verified student's contact and learner details, and are **not confirmed bookings**. They never occupy a lesson slot automatically. Teachers see these under `/ozel-dersler/yonetim/` and can mark contacted or declined. A separate `esc_lesson_time_request_mail` record is queued for the configured contact address, but no email is transmitted until a real dispatcher is connected.

**Session stability:** student and teacher frontend clients persist Supabase Auth sessions, refresh expired access tokens, and no longer sign out a valid user after transient database/Edge Function errors. The student dashboard displays a retry action while retaining login state and remembers the active panel across page refreshes.

**Current e-mail delivery status (28 October 2026):** The private-lesson queue currently has **10 pending, 0 sent** messages, and the ESC email bridge currently has **0 enabled configurations**. No Gmail lesson notification is known to have been sent. Queue ingestion and a transactional claim/ack mechanism have been implemented, but actual delivery requires installation and authorization of the external Gmail worker. Do not display "email sent" without acknowledgement.

**Private-lesson Gmail worker installation (admin action required):**

1. Sign in to [Google Apps Script](https://script.google.com/) with the `eryamanspeakingclub@gmail.com` account and create a script project. Add the contents of [integrations/esc-lesson-gmail-worker.gs](integrations/esc-lesson-gmail-worker.gs). Do not paste an API secret into the GitHub repository or browser page.
2. Run `escPrepareLessonBridge()` in Apps Script once. It generates a strong random secret and saves it privately as an Apps Script property. Copy **only the SHA-256 hex hash printed in the execution log**, not the actual token. The hash can be used by the administrator to configure `esc_email_bridge_config.token_hash` securely with enabled=true.
3. After the matching server configuration is saved, run `escLessonMailHealth()` to verify authentication; run `escLessonSendTest()` and verify receipt in the Gmail inbox and Sent folder. Grant Google's requested email authorization.
4. Run `escInstallLessonMailTrigger()` once. It installs a 5-minute trigger for `escLessonMailWorker`, which claims lesson or alternative-time messages, sends via `MailApp.sendEmail`, and acknowledges accepted send requests. Review `sending`, `uncertain` and `failed` items manually before any retry to avoid duplicates.

**Important:** API acknowledgement or a `sent` database flag indicates acceptance by Gmail, **not guaranteed inbox placement**. The teacher must sign in to `/ozel-dersler/yonetim/` with the authorized `eryamanspeakingclub@gmail.com` account. A normal student's credentials correctly receive HTTP 403 and must never be granted teacher access as a workaround.

**Booking fix (27 October 2026):** removed a database function's direct `auth.users` table read, which had caused SQL permission error `42501` for the service role. Supabase Auth JWT validation remains server-side in the student Edge Function. Verified that a three-slot booking succeeds in a transaction and rolled back the test records.

**Security:** browser clients do not receive the Supabase service-role key; a verified student's bearer token is checked server-side before account-specific data is returned. The booking RPC is callable only by the service role. Database constraints prevent double-booked active hours. Multi-slot reservations are atomic and limited to 12 future active lessons per student.

**E-mail delivery note (28 October 2026):** Existing confirmed Supabase accounts are not supposed to get another signup confirmation. Student accounts offer passwordless email login and resend verification for unconfirmed accounts. A lesson request produces an on-screen receipt, but **the Gmail delivery worker still requires Google account authorization**. Supabase creates pending admin notices for `eryamanspeakingclub@gmail.com`, student receipts, confirmations, cancellations and timed reminders; these are NOT proof of delivery. The existing `esc-email-bridge` now supports separate `lesson_claim` and `lesson_ack` operations, with server-only token authorization and no automatic retries of uncertain sends. Follow the [private-lesson Gmail installation guide](integrations/README-private-lesson-email.md) and [Apps Script worker](integrations/esc-lesson-gmail-worker.gs) to activate delivery. No API keys or passwords are stored in GitHub. At the 28 October 2026 audit 10 lesson messages were pending, none marked sent, and the sender was not configured. The authorized teacher account is `eryamanspeakingclub@gmail.com`; ordinary student accounts are not granted teacher privileges. If Supabase Auth redirects do not land correctly, include `https://eryamanspeakingclub.com/ozel-dersler/ogrenci/` in the Auth redirect URL allow list.

These links are also linked from the public private-lesson page. No password or privileged API key belongs in this public repository.

### Management model

The old **ESC Studio** entry point is no longer the primary management system. The central panel at **/admin/** now manages:

- live page text and image edits;
- draft → publish workflow;
- page sections and visibility;
- navigation and footer links;
- event date, time, venue and pricing;
- the 32-game catalogue and shared game settings;
- Educators / teacher data;
- media uploads;
- site analytics;
- SEO;
- revision history;
- administrator roles;
- custom pages created with Page Builder.

Published CMS changes are stored in Supabase and applied to the real website. A draft does not affect visitors until it is published.

## Purpose

The project has four main goals:

1. explain Eryaman Speaking Club, how meetups work, participation options, events and community feedback;
2. provide speaking games that can be opened instantly on a phone, tablet, laptop or projector;
3. provide English teachers with classes, adaptive activities and classroom tools through the Educators area;
4. let authorised administrators manage the real site through one central panel without editing source files for routine content changes.

The public frontend is served by GitHub Pages. Supabase provides authentication, shared game content, Educators data, CMS data, media storage and the administrator permission layer.

## Main features

### Club website

- Turkish landing page for Eryaman Speaking Club
- club introduction, vision and meetup flow
- participation/pricing section
- event photos, videos, statistics, feedback and FAQ
- responsive navigation and mobile layout
- 3 featured games on the homepage: **Taboo**, **Truth or Dare** and **Would You Rather?**
- link to the full 32-game Game Hub

### Game Hub

- 32 playable browser games
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

## Central administration and game management

Routine site and game administration is centralized at:

`https://eryamanspeakingclub.com/admin/`

The legacy `/esc-studio/` route remains only as a redirect to the new panel.

The management panel can control page content, images, navigation, event details, pricing, games, Educators data, media, analytics, SEO and revision history. The Game section links to supported per-game question editors when detailed library editing is needed.

Generic game libraries load from and save to Supabase. Truth or Dare and One for Me · One for You also synchronize centrally managed question/configuration data. `localStorage` remains only as a fallback/offline layer for compatible gameplay state.

Administrator sign-in uses Supabase Auth. Database writes are protected with Row Level Security and the administrator allow-list. Public visitors never receive administrator write permissions.

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
│   ├── index.html             # Full 32-game Game Hub
│   ├── games.css              # Game Hub layout
│   └── previews.css           # Game preview artwork
├── admin/
│   ├── index.html             # Central private management panel
│   ├── admin.js
│   ├── admin-editor.js
│   ├── admin-data.js
│   └── admin-structure.js
├── educators/                 # Teacher accounts, classes and classroom tools
├── join/                      # Student class-code entry
├── ozel-dersler/              # Public teacher profile + single-lesson inquiry
│   ├── ogrenci/               # Student sign-in, profiles, multi-lesson booking and lessons
│   └── yonetim/               # Authorized teacher calendar and approvals
├── integrations/              # ESC Gmail private-lesson worker + setup guide
├── esc-studio/                # Legacy redirect to /admin/#games
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
2. Supabase Auth handles central administrator and teacher authentication.
3. Supabase PostgreSQL stores the shared game library and settings.
4. RLS allows public visitors to read active game content.
5. Only authorised users in the administrator allow-list can perform protected management writes.
6. The browser uses only the public project URL and anon/publishable key. The `service_role` key must never be committed to this repository.

The Supabase project is connected, the schema/RLS policies are applied, the current game catalogue is seeded, CMS publication is live, and administrator/teacher flows are connected. The administrator account is already provisioned; credentials are managed through Supabase Auth and are not documented in the repository.

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
3. Confirm `/games/` shows all 32 games and its filters/random selector work.
4. Open the affected games and test buttons, timers, scores, turns and resets.
5. Test player/team setup and refresh persistence where applicable.
6. Test question add/edit/remove/reset from the protected management flow.
7. Check sound controls and missing assets/console errors.
8. Confirm the GitHub Pages workflow completes successfully.

## Future improvements

Changes that fit the current architecture without a rewrite include:

- automated smoke tests for internal links and game entry pages;
- consistent keyboard/focus handling for every modal;
- optional import/export for locally edited question libraries;
- lightweight offline/PWA support for unreliable event Wi-Fi;
- a shared metadata manifest to reduce duplicated game information.

The current architecture provides cross-device content sync, central site administration, Educators data and secure authentication while keeping the public frontend on GitHub Pages.
