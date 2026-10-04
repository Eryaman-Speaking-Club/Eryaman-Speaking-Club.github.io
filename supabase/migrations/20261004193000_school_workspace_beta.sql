create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.edu_schools (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  join_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  seats smallint not null default 20 check (seats between 2 and 200),
  plan text not null default 'beta' check (plan in ('beta','school','enterprise')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.edu_school_members (
  school_id uuid not null references public.edu_schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'teacher' check (role in ('owner','admin','teacher')),
  joined_at timestamptz not null default now(),
  primary key (school_id,user_id),
  unique (user_id)
);

create table if not exists public.edu_school_lesson_shares (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.edu_schools(id) on delete cascade,
  lesson_id uuid not null references public.edu_lessons(id) on delete cascade,
  shared_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (school_id,lesson_id)
);

create index if not exists edu_school_members_school_idx on public.edu_school_members(school_id);
create index if not exists edu_school_lesson_shares_school_idx on public.edu_school_lesson_shares(school_id,created_at desc);

alter table public.edu_schools enable row level security;
alter table public.edu_school_members enable row level security;
alter table public.edu_school_lesson_shares enable row level security;

create or replace function private.edu_school_role(p_school_id uuid)
returns text
language sql
stable
security definer
set search_path to ''
as $$
  select m.role
  from public.edu_school_members m
  where m.school_id=p_school_id
    and m.user_id=(select auth.uid())
  limit 1
$$;

revoke all on function private.edu_school_role(uuid) from public;
grant execute on function private.edu_school_role(uuid) to authenticated;

drop policy if exists "school members read school" on public.edu_schools;
create policy "school members read school" on public.edu_schools for select to authenticated
using (owner_id=(select auth.uid()) or private.edu_school_role(id) is not null);

drop policy if exists "owners create schools" on public.edu_schools;
create policy "owners create schools" on public.edu_schools for insert to authenticated
with check (owner_id=(select auth.uid()));

drop policy if exists "owners update schools" on public.edu_schools;
create policy "owners update schools" on public.edu_schools for update to authenticated
using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));

drop policy if exists "owners delete schools" on public.edu_schools;
create policy "owners delete schools" on public.edu_schools for delete to authenticated
using (owner_id=(select auth.uid()));

drop policy if exists "members read own or admins read roster" on public.edu_school_members;
create policy "members read own or admins read roster" on public.edu_school_members for select to authenticated
using (user_id=(select auth.uid()) or private.edu_school_role(school_id) in ('owner','admin'));

drop policy if exists "members leave or owners manage roster" on public.edu_school_members;
create policy "members leave or owners manage roster" on public.edu_school_members for delete to authenticated
using ((user_id=(select auth.uid()) and role<>'owner') or private.edu_school_role(school_id)='owner');

drop policy if exists "school members read shared lesson refs" on public.edu_school_lesson_shares;
create policy "school members read shared lesson refs" on public.edu_school_lesson_shares for select to authenticated
using (private.edu_school_role(school_id) is not null);

drop policy if exists "teachers share own lessons" on public.edu_school_lesson_shares;
create policy "teachers share own lessons" on public.edu_school_lesson_shares for insert to authenticated
with check (
  shared_by=(select auth.uid())
  and private.edu_school_role(school_id) is not null
  and exists(select 1 from public.edu_lessons l where l.id=lesson_id and l.teacher_id=(select auth.uid()))
);

drop policy if exists "sharers or school admins remove shares" on public.edu_school_lesson_shares;
create policy "sharers or school admins remove shares" on public.edu_school_lesson_shares for delete to authenticated
using (shared_by=(select auth.uid()) or private.edu_school_role(school_id) in ('owner','admin'));

revoke all on public.edu_schools from anon;
revoke all on public.edu_school_members from anon;
revoke all on public.edu_school_lesson_shares from anon;
grant select,insert,update,delete on public.edu_schools to authenticated;
grant select,delete on public.edu_school_members to authenticated;
grant select,insert,delete on public.edu_school_lesson_shares to authenticated;

create or replace function public.edu_create_school(p_name text)
returns jsonb language plpgsql security definer set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_school public.edu_schools%rowtype;
  v_name text;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if exists(select 1 from public.edu_school_members where user_id=v_uid) then raise exception 'SCHOOL_MEMBERSHIP_EXISTS'; end if;
  v_name:=left(trim(coalesce(p_name,'')),120);
  if char_length(v_name)<2 then raise exception 'INVALID_SCHOOL_NAME'; end if;
  insert into public.edu_schools(owner_id,name) values(v_uid,v_name) returning * into v_school;
  insert into public.edu_school_members(school_id,user_id,role) values(v_school.id,v_uid,'owner');
  return jsonb_build_object('id',v_school.id,'name',v_school.name,'join_code',v_school.join_code,'seats',v_school.seats,'plan',v_school.plan,'role','owner');
end;
$$;

create or replace function public.edu_join_school(p_join_code text)
returns jsonb language plpgsql security definer set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_school public.edu_schools%rowtype;
  v_count int;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if exists(select 1 from public.edu_school_members where user_id=v_uid) then raise exception 'SCHOOL_MEMBERSHIP_EXISTS'; end if;
  select * into v_school from public.edu_schools
  where join_code=upper(trim(coalesce(p_join_code,''))) and is_active=true limit 1 for update;
  if v_school.id is null then raise exception 'SCHOOL_NOT_FOUND'; end if;
  select count(*) into v_count from public.edu_school_members where school_id=v_school.id;
  if v_count>=v_school.seats then raise exception 'SCHOOL_FULL'; end if;
  insert into public.edu_school_members(school_id,user_id,role) values(v_school.id,v_uid,'teacher');
  return jsonb_build_object('id',v_school.id,'name',v_school.name,'join_code',v_school.join_code,'seats',v_school.seats,'plan',v_school.plan,'role','teacher');
end;
$$;

create or replace function public.edu_get_school_state()
returns jsonb language plpgsql security definer set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_membership public.edu_school_members%rowtype;
  v_school public.edu_schools%rowtype;
  v_members jsonb;
  v_lessons jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_membership from public.edu_school_members where user_id=v_uid limit 1;
  if v_membership.school_id is null then return jsonb_build_object('school',null,'members','[]'::jsonb,'shared_lessons','[]'::jsonb); end if;
  select * into v_school from public.edu_schools where id=v_membership.school_id and is_active=true;
  if v_school.id is null then return jsonb_build_object('school',null,'members','[]'::jsonb,'shared_lessons','[]'::jsonb); end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',m.user_id,'display_name',coalesce(p.display_name,'Teacher'),'role',m.role,'joined_at',m.joined_at
  ) order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end,p.display_name),'[]'::jsonb)
  into v_members
  from public.edu_school_members m
  left join public.educator_profiles p on p.user_id=m.user_id
  where m.school_id=v_school.id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'share_id',s.id,'lesson_id',l.id,'title',l.title,'topic',l.topic,'duration_minutes',l.duration_minutes,
    'primary_goal',l.primary_goal,'shared_by',s.shared_by,'shared_by_name',coalesce(p.display_name,'Teacher'),
    'shared_at',s.created_at,'can_unshare',(s.shared_by=v_uid or v_membership.role in ('owner','admin'))
  ) order by s.created_at desc),'[]'::jsonb)
  into v_lessons
  from public.edu_school_lesson_shares s
  join public.edu_lessons l on l.id=s.lesson_id
  left join public.educator_profiles p on p.user_id=s.shared_by
  where s.school_id=v_school.id;

  return jsonb_build_object(
    'school',jsonb_build_object('id',v_school.id,'name',v_school.name,'join_code',v_school.join_code,'seats',v_school.seats,'plan',v_school.plan,'role',v_membership.role,'member_count',jsonb_array_length(v_members)),
    'members',v_members,'shared_lessons',v_lessons
  );
end;
$$;

create or replace function public.edu_share_school_lesson(p_school_id uuid,p_lesson_id uuid)
returns boolean language plpgsql security definer set search_path to ''
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if private.edu_school_role(p_school_id) is null then raise exception 'SCHOOL_ACCESS_DENIED'; end if;
  if not exists(select 1 from public.edu_lessons where id=p_lesson_id and teacher_id=v_uid) then raise exception 'LESSON_ACCESS_DENIED'; end if;
  insert into public.edu_school_lesson_shares(school_id,lesson_id,shared_by)
  values(p_school_id,p_lesson_id,v_uid) on conflict (school_id,lesson_id) do nothing;
  return true;
end;
$$;

create or replace function public.edu_unshare_school_lesson(p_share_id uuid)
returns boolean language plpgsql security definer set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_share public.edu_school_lesson_shares%rowtype;
  v_role text;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_share from public.edu_school_lesson_shares where id=p_share_id;
  if v_share.id is null then return true; end if;
  v_role:=private.edu_school_role(v_share.school_id);
  if v_role is null then raise exception 'SCHOOL_ACCESS_DENIED'; end if;
  if v_share.shared_by<>v_uid and v_role not in ('owner','admin') then raise exception 'SHARE_ACCESS_DENIED'; end if;
  delete from public.edu_school_lesson_shares where id=p_share_id;
  return true;
end;
$$;

create or replace function public.edu_copy_school_lesson(p_share_id uuid,p_class_id uuid)
returns jsonb language plpgsql security definer set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_share public.edu_school_lesson_shares%rowtype;
  v_source public.edu_lessons%rowtype;
  v_new public.edu_lessons%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_share from public.edu_school_lesson_shares where id=p_share_id;
  if v_share.id is null then raise exception 'SHARE_NOT_FOUND'; end if;
  if private.edu_school_role(v_share.school_id) is null then raise exception 'SCHOOL_ACCESS_DENIED'; end if;
  if not exists(select 1 from public.edu_classes where id=p_class_id and teacher_id=v_uid and is_active=true) then raise exception 'CLASS_ACCESS_DENIED'; end if;
  select * into v_source from public.edu_lessons where id=v_share.lesson_id;
  if v_source.id is null then raise exception 'LESSON_NOT_FOUND'; end if;
  insert into public.edu_lessons(class_id,teacher_id,title,topic,duration_minutes,primary_goal,plan,status)
  values(p_class_id,v_uid,v_source.title,v_source.topic,v_source.duration_minutes,v_source.primary_goal,v_source.plan,'ready')
  returning * into v_new;
  return jsonb_build_object('id',v_new.id,'class_id',v_new.class_id,'title',v_new.title,'topic',v_new.topic,'duration_minutes',v_new.duration_minutes,'primary_goal',v_new.primary_goal,'status',v_new.status);
end;
$$;

create or replace function public.edu_leave_school()
returns boolean language plpgsql security definer set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_membership public.edu_school_members%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_membership from public.edu_school_members where user_id=v_uid limit 1;
  if v_membership.school_id is null then return true; end if;
  if v_membership.role='owner' then raise exception 'OWNER_CANNOT_LEAVE'; end if;
  delete from public.edu_school_members where school_id=v_membership.school_id and user_id=v_uid;
  return true;
end;
$$;

revoke all on function public.edu_create_school(text) from public;
revoke all on function public.edu_join_school(text) from public;
revoke all on function public.edu_get_school_state() from public;
revoke all on function public.edu_share_school_lesson(uuid,uuid) from public;
revoke all on function public.edu_unshare_school_lesson(uuid) from public;
revoke all on function public.edu_copy_school_lesson(uuid,uuid) from public;
revoke all on function public.edu_leave_school() from public;
revoke execute on function public.edu_create_school(text) from anon;
revoke execute on function public.edu_join_school(text) from anon;
revoke execute on function public.edu_get_school_state() from anon;
revoke execute on function public.edu_share_school_lesson(uuid,uuid) from anon;
revoke execute on function public.edu_unshare_school_lesson(uuid) from anon;
revoke execute on function public.edu_copy_school_lesson(uuid,uuid) from anon;
revoke execute on function public.edu_leave_school() from anon;

grant execute on function public.edu_create_school(text) to authenticated;
grant execute on function public.edu_join_school(text) to authenticated;
grant execute on function public.edu_get_school_state() to authenticated;
grant execute on function public.edu_share_school_lesson(uuid,uuid) to authenticated;
grant execute on function public.edu_unshare_school_lesson(uuid) to authenticated;
grant execute on function public.edu_copy_school_lesson(uuid,uuid) to authenticated;
grant execute on function public.edu_leave_school() to authenticated;
