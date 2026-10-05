# Public games audit — 5 October 2026

## Verification

All 32 public game pages passed Chromium functional scenarios and 390 × 844 narrow-screen layout checks. The functional suite contains 245 named check groups. Native fullscreen entry and exit were tested through the browser API, waiting for asynchronous state transitions. No JavaScript page errors were recorded in the passing scenarios.

The final HTTP browser run is GitHub Actions run `37284630353`, workflow `Verify public game repairs`. The result aggregator required 32/32 functional and 32/32 narrow-screen results to pass before the 40 source changes were committed. Evidence artifact: `public-game-qa`, artifact ID `11334116238`. Verified source commit on the temporary test branch: `9ef32027ba5ac0d3cdf7ae80966e189d4bc3d110`.

Tests use read-only empty fixtures for optional backend/CMS services so no real learner or teacher data is changed. This does not verify production database synchronization, physical iPhone/Safari behavior, audio hardware, or an actual Google Meet call. Passing these scenarios is not a guarantee that every possible interaction is bug-free.

## Changes

- All public games load a shared icon-only fullscreen control. It preserves game state, supports standard and WebKit APIs, provides a visible in-page presentation fallback when native fullscreen is unavailable, and avoids duplicate cached controls.
- Fullscreen controls remain icon-only when active. The descriptive label is in the tooltip and accessibility attributes. The educator game overlay label is also hidden.
- Taboo now has correct +1, forbidden-word/Taboo -1 and pass 0 controls, separate counters, pause/resume, deadline checks, locked scoring outside the timed round, and single-application team scoring with speaker rotation.
- Taboo Hide card / Show card removes the target and forbidden words from the displayed card without advancing it. Online hosts must send the word privately themselves before sharing the screen; no private-message service was added.
- Conversation Bingo now creates a valid 16-cell unique board, tracks marked cells, detects rows/columns/diagonals and full-card completion, and supports undo and new-card reset.
- Shared card navigation now preserves previous/next order. Ranking choices can be undone and reindexed. Desert Island limits selection to three and supports changing choices.
- Timed newer games include pause/resume/restart and clear timers on the next card. Hot Seat locks scoring before start and after time ends.
- Debate Roulette retains its existing 10-second preparation and 45-second speaking sequence. Both the base page and legacy enhancement now require a chosen side before starting.
- Sound popovers no longer remain permanently visible in newer games. Form/button keyboard input no longer accidentally triggers next-card shortcuts.
- Optional five-second-game scoreboard player names are rendered as text rather than executable markup.

## Game-by-game result

| Public game | Functional | Narrow screen |
|---|---|---|
| Truth or Dare | PASS | PASS |
| One for Me, One for You | PASS | PASS |
| Last Thing You Did | PASS | PASS |
| What Would You Do If | PASS | PASS |
| Would You Rather | PASS | PASS |
| Most Likely To | PASS | PASS |
| Hot Seat | PASS | PASS |
| Five Second Challenge | PASS | PASS |
| Red Flag / Green Flag | PASS | PASS |
| Taboo | PASS | PASS |
| Debate Roulette | PASS | PASS |
| Never Have I Ever | PASS | PASS |
| Two Truths & One Lie | PASS | PASS |
| Who Am I | PASS | PASS |
| Story Chain | PASS | PASS |
| Explain It Badly | PASS | PASS |
| Question Roulette | PASS | PASS |
| Opinion Line | PASS | PASS |
| Ranking Room | PASS | PASS |
| Detective / Alibi | PASS | PASS |
| Finish the Sentence | PASS | PASS |
| Three Clues | PASS | PASS |
| Secret Mission | PASS | PASS |
| One-Minute Story | PASS | PASS |
| Would I Lie to You | PASS | PASS |
| Desert Island | PASS | PASS |
| Conversation Bingo | PASS | PASS |
| Emoji Story | PASS | PASS |
| Worst Advice Only | PASS | PASS |
| Sell Me This | PASS | PASS |
| Hot Take | PASS | PASS |
| Photo Talk | PASS | PASS |
