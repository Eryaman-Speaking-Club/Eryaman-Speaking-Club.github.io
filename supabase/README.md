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

After creating an Auth user, add that user's UUID to:

```sql
insert into public.esc_admins (user_id)
values ('USER_UUID_HERE');
```

## Planned migration flow

1. Create/connect the Supabase project.
2. Apply `schema.sql`.
3. Create the ESC admin Auth account.
4. Add the admin user UUID to `esc_admins`.
5. Put the project URL and anon/publishable key into `esc-supabase-config.js`.
6. Seed current built-in game content.
7. Switch ESC Studio saves from browser-only localStorage to Supabase.
8. Keep localStorage only as a temporary offline/fallback layer.
