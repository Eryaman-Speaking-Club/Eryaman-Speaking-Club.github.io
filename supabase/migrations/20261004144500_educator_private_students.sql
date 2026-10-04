create table if not exists public.edu_private_students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  level text not null default 'A2' check (level in ('Pre-A1','A1','A2','B1','B2')),
  school_grade text,
  goals text[] not null default '{}',
  focus_notes text,
  homework text,
  last_lesson_note text,
  next_lesson_note text,
  next_lesson_at timestamptz,
  difficult_topics text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.edu_private_students enable row level security;

grant select, insert, update, delete on public.edu_private_students to authenticated;

drop policy if exists "teachers read own private students" on public.edu_private_students;
create policy "teachers read own private students"
  on public.edu_private_students for select
  to authenticated
  using ((select auth.uid()) = teacher_id);

drop policy if exists "teachers insert own private students" on public.edu_private_students;
create policy "teachers insert own private students"
  on public.edu_private_students for insert
  to authenticated
  with check ((select auth.uid()) = teacher_id);

drop policy if exists "teachers update own private students" on public.edu_private_students;
create policy "teachers update own private students"
  on public.edu_private_students for update
  to authenticated
  using ((select auth.uid()) = teacher_id)
  with check ((select auth.uid()) = teacher_id);

drop policy if exists "teachers delete own private students" on public.edu_private_students;
create policy "teachers delete own private students"
  on public.edu_private_students for delete
  to authenticated
  using ((select auth.uid()) = teacher_id);

create index if not exists edu_private_students_teacher_updated_idx
  on public.edu_private_students (teacher_id, updated_at desc);
