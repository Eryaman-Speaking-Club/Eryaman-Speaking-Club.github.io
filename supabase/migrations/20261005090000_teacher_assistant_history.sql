create table if not exists public.edu_assistant_generations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  level text not null,
  age_group text not null,
  goal text not null,
  duration_minutes integer not null,
  class_size integer not null,
  brief jsonb not null default '{}'::jsonb,
  pack jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.edu_assistant_generations enable row level security;

drop policy if exists "Teachers read own assistant generations" on public.edu_assistant_generations;
create policy "Teachers read own assistant generations"
on public.edu_assistant_generations for select
to authenticated
using ((select auth.uid()) = teacher_id);

drop policy if exists "Teachers insert own assistant generations" on public.edu_assistant_generations;
create policy "Teachers insert own assistant generations"
on public.edu_assistant_generations for insert
to authenticated
with check ((select auth.uid()) = teacher_id);

drop policy if exists "Teachers delete own assistant generations" on public.edu_assistant_generations;
create policy "Teachers delete own assistant generations"
on public.edu_assistant_generations for delete
to authenticated
using ((select auth.uid()) = teacher_id);

grant select, insert, delete on public.edu_assistant_generations to authenticated;

create index if not exists edu_assistant_generations_teacher_created_idx
  on public.edu_assistant_generations(teacher_id, created_at desc);

create index if not exists edu_school_lesson_shares_lesson_idx
  on public.edu_school_lesson_shares(lesson_id);

create index if not exists edu_school_lesson_shares_shared_by_idx
  on public.edu_school_lesson_shares(shared_by);

create index if not exists edu_schools_owner_idx
  on public.edu_schools(owner_id);
