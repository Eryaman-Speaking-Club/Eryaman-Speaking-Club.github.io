create table if not exists public.edu_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.edu_classes(id) on delete cascade,
  lesson_id uuid references public.edu_lessons(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  instructions text,
  due_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','closed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.edu_assignments enable row level security;
grant select, insert, update, delete on public.edu_assignments to authenticated;

drop policy if exists "teachers read own assignments" on public.edu_assignments;
create policy "teachers read own assignments"
  on public.edu_assignments for select to authenticated
  using ((select auth.uid()) = teacher_id);

drop policy if exists "teachers insert own assignments" on public.edu_assignments;
create policy "teachers insert own assignments"
  on public.edu_assignments for insert to authenticated
  with check ((select auth.uid()) = teacher_id);

drop policy if exists "teachers update own assignments" on public.edu_assignments;
create policy "teachers update own assignments"
  on public.edu_assignments for update to authenticated
  using ((select auth.uid()) = teacher_id)
  with check ((select auth.uid()) = teacher_id);

drop policy if exists "teachers delete own assignments" on public.edu_assignments;
create policy "teachers delete own assignments"
  on public.edu_assignments for delete to authenticated
  using ((select auth.uid()) = teacher_id);

create index if not exists edu_assignments_teacher_updated_idx
  on public.edu_assignments (teacher_id, updated_at desc);
create index if not exists edu_assignments_class_status_due_idx
  on public.edu_assignments (class_id, status, due_at);

create or replace function public.edu_student_state(p_join_token text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_hash text;
  v_student public.edu_students%rowtype;
  v_class public.edu_classes%rowtype;
  v_session public.edu_live_sessions%rowtype;
  v_assignments jsonb;
begin
  if p_join_token is null or char_length(p_join_token) < 24 or char_length(p_join_token) > 200 then
    raise exception 'INVALID_JOIN_TOKEN';
  end if;

  v_hash := encode(extensions.digest(p_join_token, 'sha256'), 'hex');

  select * into v_student
  from public.edu_students
  where join_token_hash = v_hash and is_active = true
  limit 1;

  if v_student.id is null then
    raise exception 'STUDENT_SESSION_NOT_FOUND';
  end if;

  select * into v_class from public.edu_classes where id = v_student.class_id;
  if v_class.id is null or not v_class.is_active then
    raise exception 'CLASS_NOT_AVAILABLE';
  end if;

  update public.edu_students set last_seen_at = now() where id = v_student.id;

  select * into v_session
  from public.edu_live_sessions
  where class_id = v_class.id and status in ('waiting','active','paused')
  order by started_at desc
  limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'title',q.title,'instructions',q.instructions,'due_at',q.due_at,
    'payload',q.payload,'completed',q.completed
  ) order by q.due_at nulls last,q.created_at desc),'[]'::jsonb)
  into v_assignments
  from (
    select a.id,a.title,a.instructions,a.due_at,a.payload,a.created_at,
      exists(
        select 1 from public.edu_student_results r
        where r.student_id=v_student.id
          and r.activity_type='assignment'
          and r.payload->>'assignment_id'=a.id::text
      ) completed
    from public.edu_assignments a
    where a.class_id=v_class.id and a.status='published'
    order by a.due_at nulls last,a.created_at desc
    limit 20
  ) q;

  return jsonb_build_object(
    'student',jsonb_build_object('id',v_student.id,'display_name',v_student.display_name),
    'class',jsonb_build_object(
      'id',v_class.id,'name',v_class.name,'age_group',v_class.age_group,
      'level',v_class.level,'focus',v_class.focus,'join_code',v_class.join_code
    ),
    'session',case when v_session.id is null then null else jsonb_build_object(
      'id',v_session.id,'status',v_session.status,'current_index',v_session.current_index,
      'current_stage',v_session.current_stage,'current_payload',v_session.current_payload,
      'scores',v_session.scores,'updated_at',v_session.updated_at
    ) end,
    'assignments',v_assignments
  );
end;
$function$;

create or replace function public.edu_submit_result(
  p_join_token text,
  p_session_id uuid,
  p_activity_type text,
  p_score numeric,
  p_payload jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_hash text;
  v_student public.edu_students%rowtype;
  v_session public.edu_live_sessions%rowtype;
  v_assignment_id uuid;
begin
  if p_join_token is null or char_length(p_join_token) < 24 or char_length(p_join_token) > 200 then return false; end if;
  if p_activity_type is null or char_length(trim(p_activity_type)) < 1 or char_length(trim(p_activity_type)) > 40 then return false; end if;
  if p_score is not null and (p_score < 0 or p_score > 1000) then return false; end if;

  v_hash := encode(extensions.digest(p_join_token,'sha256'),'hex');
  select * into v_student from public.edu_students
  where join_token_hash=v_hash and is_active=true limit 1;
  if v_student.id is null then return false; end if;

  if p_session_id is not null then
    select * into v_session from public.edu_live_sessions
    where id=p_session_id and class_id=v_student.class_id limit 1;
    if v_session.id is null then return false; end if;
  end if;

  if trim(p_activity_type)='assignment' then
    begin
      v_assignment_id := nullif(p_payload->>'assignment_id','')::uuid;
    exception when others then
      return false;
    end;
    if v_assignment_id is null or not exists(
      select 1 from public.edu_assignments a
      where a.id=v_assignment_id and a.class_id=v_student.class_id and a.status='published'
    ) then return false; end if;
  end if;

  insert into public.edu_student_results(student_id,class_id,session_id,activity_type,score,payload)
  values(v_student.id,v_student.class_id,p_session_id,trim(p_activity_type),p_score,coalesce(p_payload,'{}'::jsonb));
  return true;
end;
$function$;
