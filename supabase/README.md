# Supabase backend for ESC Studio

This folder contains the database schema for the central ESC Studio backend.

## What the backend is for

The current GitHub Pages site can keep serving the public website and games for free. Supabase adds:

- central game content shared across devices;
- real admin authentication;
- Row Level Security (RLS);
- one source of truth for questions/cards/settings;
- the ability to edit in ESC Studio and have changes appear for every visitor.

## Files

- `schema.sql` — tables, RLS policies, helper functions and the 12 game records.

## Safe frontend key usage

The browser may contain the Supabase **project URL** and **anon/publishable key**. This is expected for Supabase web apps.

Never place the **service_role** key in this repository or any browser JavaScript.

RLS is the security boundary. Public users can read active game content; authenticated ESC admins can write.

## Admin bootstrap

ESC Studio uses Supabase Auth. The first admin is claimed with a short-lived one-time bootstrap code stored only in the private database schema. After the first admin is created, the bootstrap row is deleted and later users must be added deliberately to `esc_admins`.

Do not commit bootstrap codes, user passwords, secret keys or the `service_role` key.

## Current rollout status

1. Supabase project is connected to the frontend.
2. The schema and RLS policies are applied.
3. All 12 games are registered.
4. Existing game libraries/settings are seeded into `game_settings`.
5. Generic game editors save centrally to Supabase.
6. Truth or Dare and One for Me · One for You synchronize their managed content with Supabase.
7. ESC Studio uses Supabase Auth.
8. `localStorage` remains only as a fallback/offline copy and for gameplay-local state such as rosters/scores.
