# Speaking levels: direct buttons and 50-card libraries

## Release 20261007-level50-2

All 32 existing game pages and the Game Hub use direct A1, A2, B1, B2 and C1 buttons rather than a dropdown. The visible level bar is standardised as Seviye / Level + five pill buttons + the current level card count on the right, matching the approved game-page layout. Exactly one button is pressed at a time. Keyboard activation uses the same real buttons. Category selection is independent of level selection; a supported category is retained on a level change, and both filters are represented in the URL. Category counts and disabled states are refreshed for the new level.

All 32 games now have at least 50 cards/items at every CEFR level: A1=50+, A2=50+, B1=50+, B2=50+, C1=50+, so every game has at least 250 level-specific placements overall. Truth or Dare has 50 Truth questions AND 50 Dare tasks at each level (100 per level). Taboo, Who Am I, Explain It Badly and Three Clues now also have 50 level-appropriate vocabulary items per level while keeping their original mechanics.

Total placements across the 160 game-level libraries: 8,250. Placements are not globally unique questions. Related formats intentionally reuse appropriate content. In visual, ranking and storytelling activities, a coherent scene or word set can be shared across levels while the required communicative task and response support differ. The material is teaching practice, not a certified or empirically calibrated CEFR test.

Reference: Council of Europe, CEFR level descriptions and Global Scale. https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions

## Content and editing

The reviewed additions are in cefr50-conversation.js, cefr50-interpersonal.js, cefr50-activities.js and cefr50-structured.js. Each addition is explicitly authored. No random topic/template cross-product is used to fill quotas. Existing topic choices are retained. Category matching no longer mistakes substrings such as hat in what or app in happy for topic evidence.

Old ungraded local/cloud content remains archived rather than being mixed into graded play. The level editor always opens the FULL level, even when the current game is filtered to one category. Saving a filtered session cannot silently replace the other categories. Existing authentication, row-level security, player names and unrelated settings are not weakened or replaced. Current database inspection before this release found no saved cefr override objects requiring migration.

## Build and checks

Run python3 tools/cefr_build.py before previewing a checkout. The final release pass normalizes every game bootstrap, including pages previously containing a partial or deferred integration. The order is source, bank, four reviewed addition modules, then runtime. New asset versions prevent old shared scripts from being reused by a newly loaded game page. Running the full build twice is tested.

node tests/cefr-check.cjs checks all 160 libraries, exact counts, shapes, duplicates, topic vocabularies and legacy-content exclusion. tests/cefr-browser.cjs covers game navigation, level switches, help dialogs, mobile layouts and animation/timer regressions. tests/cefr-edits.cjs checks sequential edits, refresh persistence and unrelated-setting preservation. tests/cefr-buttons.cjs exercises every available level/category combination, direct-button states, mobile button overflow, keyboard activation, persisted filters and editing a full library from a filtered session.

Browser persistence tests use a controlled mock backend; they are not claims that live credentials or every external service have been tested. GitHub Pages deployment status is checked separately. Learner experience should still inform future editorial revisions.
