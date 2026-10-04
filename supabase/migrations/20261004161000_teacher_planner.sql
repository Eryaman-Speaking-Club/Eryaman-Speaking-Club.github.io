create table if not exists public.edu_schedule_events (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.edu_classes(id) on delete set null,
  private_student_id uuid references public.edu_private_students(id) on delete set null,
  lesson_id uuid references public.edu_lessons(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  starts_at timestamptz not null,
  duration_minutes smallint not null default 40 check (duration_minutes between 5 and 300),
  notes text,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.edu_schedule_events enable row level security;
grant select,insert,update,delete on public.edu_schedule_events to authenticated;

drop policy if exists "teachers read own schedule" on public.edu_schedule_events;
create policy "teachers read own schedule" on public.edu_schedule_events
  for select to authenticated using ((select auth.uid())=teacher_id);

drop policy if exists "teachers insert own schedule" on public.edu_schedule_events;
create policy "teachers insert own schedule" on public.edu_schedule_events
  for insert to authenticated with check ((select auth.uid())=teacher_id);

drop policy if exists "teachers update own schedule" on public.edu_schedule_events;
create policy "teachers update own schedule" on public.edu_schedule_events
  for update to authenticated using ((select auth.uid())=teacher_id)
  with check ((select auth.uid())=teacher_id);

drop policy if exists "teachers delete own schedule" on public.edu_schedule_events;
create policy "teachers delete own schedule" on public.edu_schedule_events
  for delete to authenticated using ((select auth.uid())=teacher_id);

create index if not exists edu_schedule_teacher_start_idx on public.edu_schedule_events (teacher_id,starts_at);
create index if not exists edu_schedule_class_idx on public.edu_schedule_events (class_id);
create index if not exists edu_schedule_private_idx on public.edu_schedule_events (private_student_id);
create index if not exists edu_schedule_lesson_idx on public.edu_schedule_events (lesson_id);
