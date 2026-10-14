
-- Eryaman Speaking Club dynamic events: one canonical event schedule.
-- Additive migration only. Existing CMS, Sheets and historical data remain unchanged.
create sequence if not exists public.esc_event_code_seq start with 23;
create or replace function public.esc_next_event_code()
returns text language plpgsql volatile set search_path = ''
as $$
declare n bigint;
begin
  n := nextval('public.esc_event_code_seq'::regclass);
  return 'ETK-' || case when n < 1000 then lpad(n::text,3,'0') else n::text end;
end; $$;
revoke all on function public.esc_next_event_code() from public, anon;
grant execute on function public.esc_next_event_code() to authenticated, service_role;

create or replace function public.esc_can_manage_events()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.esc_admin_profiles p
    where p.user_id = (select auth.uid()) and p.active = true
      and p.role in ('super_admin','editor')
  );
$$;
revoke all on function public.esc_can_manage_events() from public, anon;
grant execute on function public.esc_can_manage_events() to authenticated, service_role;

create table if not exists public.esc_event_rules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default 'English Speaking Meetup',
  weekday smallint not null check (weekday between 0 and 6),
  start_time time without time zone not null,
  duration_minutes int not null check (duration_minutes between 30 and 480),
  kind text not null check (kind in ('in_person','online')),
  venue text not null check (char_length(trim(venue)) between 2 and 160),
  map_url text,
  meeting_url text,
  capacity integer not null default 15 check (capacity between 1 and 500),
  active boolean not null default false,
  published boolean not null default true,
  start_date date not null default current_date,
  end_date date,
  horizon_days integer not null default 35 check (horizon_days between 7 and 90),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint esc_rule_end_after_start check (end_date is null or end_date >= start_date)
);

create table if not exists public.esc_events (
  id uuid primary key default gen_random_uuid(),
  event_code text not null unique default public.esc_next_event_code(),
  title text not null default 'English Speaking Meetup' check (char_length(trim(title)) between 2 and 160),
  kind text not null check (kind in ('in_person','online')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  venue text not null check (char_length(trim(venue)) between 2 and 160),
  location_url text,
  meeting_url text,
  registration_url text,
  capacity int not null default 15 check (capacity between 1 and 500),
  status text not null default 'planned' check (status in ('draft','planned','cancelled','completed')),
  published boolean not null default true,
  registration_enabled boolean not null default true,
  theme text not null default '',
  note text not null default '',
  recurrence_id uuid references public.esc_event_rules(id) on delete set null,
  original_date date,
  manual_override boolean not null default false,
  revision integer not null default 1 check (revision >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint esc_event_time_order check (end_at > start_at),
  constraint esc_event_recurrence_source check ((recurrence_id is null and original_date is null) or (recurrence_id is not null and original_date is not null))
);
create unique index if not exists esc_event_recurrence_date_unique on public.esc_events(recurrence_id,original_date) where recurrence_id is not null;
create index if not exists esc_events_start_at_idx on public.esc_events(start_at);
create index if not exists esc_events_status_start_idx on public.esc_events(status,start_at);

create table if not exists public.esc_event_audit (
  id bigint generated always as identity primary key,
  event_id uuid not null references public.esc_events(id) on delete cascade,
  revision int not null,
  kind text not null check (kind in ('created','rescheduled','changed','cancelled','completed','restored')),
  old_data jsonb,
  new_data jsonb not null,
  created_at timestamptz not null default now(),
  actor uuid
);
create index if not exists esc_event_audit_event_idx on public.esc_event_audit(event_id,revision);

create table if not exists public.esc_event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.esc_events(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 100),
  email text not null check (char_length(email) between 5 and 254),
  email_key text generated always as (lower(btrim(email))) stored,
  consent boolean not null default false,
  status text not null default 'registered' check (status in ('registered','cancelled','attended','no_show')),
  first_visit boolean not null default false,
  source text not null default 'website' check (source in ('website','admin','legacy')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint esc_registration_per_event_unique unique (event_id,email_key)
);
create index if not exists esc_registrations_event_status_idx on public.esc_event_registrations(event_id,status);

create table if not exists public.esc_event_notifications (
  id bigint generated always as identity primary key,
  event_id uuid not null references public.esc_events(id) on delete cascade,
  registration_id uuid not null references public.esc_event_registrations(id) on delete cascade,
  kind text not null check (kind in ('welcome','reminder','change','cancelled','thanks')),
  event_revision integer not null default 1,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','uncertain')),
  sent_at timestamptz,
  provider_message_id text,
  error_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint esc_event_notification_unique unique (event_id,registration_id,kind,event_revision)
);
create index if not exists esc_notifications_delivery_idx on public.esc_event_notifications(status,created_at);

create table if not exists public.esc_registration_attempts (
  day date not null default current_date,
  fingerprint text not null,
  attempts integer not null default 1,
  primary key(day,fingerprint)
);

create or replace function public.esc_event_biu()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  event_kind text;
begin
  if tg_op = 'INSERT' then
    new.updated_at := now();
    new.created_at := coalesce(new.created_at,now());
    new.revision := 1;
    new.updated_by := (select auth.uid());
    return new;
  end if;
  if old.status = 'completed' and new.status = 'planned'
     and not public.esc_can_manage_events() then
    raise exception 'Completed event cannot be reopened automatically';
  end if;
  if (new.start_at,new.end_at,new.venue,new.kind,new.status,new.title,
      new.capacity,new.location_url,new.meeting_url,new.published,
      new.registration_enabled,new.theme)
       is distinct from
     (old.start_at,old.end_at,old.venue,old.kind,old.status,old.title,
      old.capacity,old.location_url,old.meeting_url,old.published,
      old.registration_enabled,old.theme) then
    new.revision := old.revision+1;
    if new.recurrence_id is not null and (select auth.uid()) is not null
       then new.manual_override := true; end if;
  else
    new.revision := old.revision;
  end if;
  new.updated_at := now();
  new.updated_by := coalesce((select auth.uid()),old.updated_by);
  return new;
end;
$$;
drop trigger if exists esc_event_biu_trigger on public.esc_events;
create trigger esc_event_biu_trigger before insert or update on public.esc_events
for each row execute function public.esc_event_biu();

create or replace function public.esc_event_audit_trg()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare k text;
begin
  if tg_op = 'INSERT' then k := 'created';
  elsif old.revision = new.revision then return new;
  elsif old.status <> 'cancelled' and new.status = 'cancelled' then k := 'cancelled';
  elsif new.status = 'completed' then k := 'completed';
  elsif old.status = 'cancelled' and new.status = 'planned' then k := 'restored';
  elsif (old.start_at,old.end_at) is distinct from (new.start_at,new.end_at) then k := 'rescheduled';
  else k := 'changed'; end if;
  insert into public.esc_event_audit(event_id,revision,kind,old_data,new_data,actor)
  values(new.id,new.revision,k,
    case when tg_op = 'INSERT' then null else jsonb_build_object('start_at',old.start_at,
      'end_at',old.end_at,'venue',old.venue,'status',old.status,'kind',old.kind) end,
    jsonb_build_object('start_at',new.start_at,'end_at',new.end_at,'venue',new.venue,
      'status',new.status,'kind',new.kind), (select auth.uid()));
  return new;
end;
$$;
drop trigger if exists esc_event_audit_trigger on public.esc_events;
create trigger esc_event_audit_trigger after insert or update on public.esc_events
for each row execute function public.esc_event_audit_trg();

alter table public.esc_event_rules enable row level security;
alter table public.esc_events enable row level security;
alter table public.esc_event_registrations enable row level security;
alter table public.esc_event_audit enable row level security;
alter table public.esc_event_notifications enable row level security;
alter table public.esc_registration_attempts enable row level security;

create policy "Public can see published event details" on public.esc_events for select
to anon,authenticated using (published=true and (status in ('planned','cancelled','completed') or public.esc_can_manage_events()));
create policy "Editors can read event drafts" on public.esc_events for select
to authenticated using ((select public.esc_can_manage_events()));
create policy "Editors insert events" on public.esc_events for insert to authenticated
with check ((select public.esc_can_manage_events()));
create policy "Editors update events" on public.esc_events for update to authenticated
using ((select public.esc_can_manage_events())) with check ((select public.esc_can_manage_events()));
create policy "Editors read recurrence rules" on public.esc_event_rules for select to authenticated using ((select public.esc_can_manage_events()));
create policy "Editors insert recurrence rules" on public.esc_event_rules for insert to authenticated with check ((select public.esc_can_manage_events()));
create policy "Editors update recurrence rules" on public.esc_event_rules for update to authenticated
using ((select public.esc_can_manage_events())) with check ((select public.esc_can_manage_events()));
create policy "Editors can manage registration list" on public.esc_event_registrations
for all to authenticated using ((select public.esc_can_manage_events())) with check ((select public.esc_can_manage_events()));
create policy "Editors can read event change history" on public.esc_event_audit for select
to authenticated using ((select public.esc_can_manage_events()));
create policy "Editors read delivery history" on public.esc_event_notifications for select
to authenticated using ((select public.esc_can_manage_events()));

revoke all on public.esc_registration_attempts from anon,authenticated;
revoke all on public.esc_event_notifications from anon,authenticated;
revoke all on public.esc_event_audit from anon;
grant select on public.esc_events to anon,authenticated;
grant insert,update on public.esc_events to authenticated;
grant select,insert,update on public.esc_event_rules to authenticated;
grant select,insert,update,delete on public.esc_event_registrations to authenticated;
grant select on public.esc_event_audit,public.esc_event_notifications to authenticated;

-- Atomic sign-up: service role only. Keeps contact data private.
create or replace function public.esc_register_for_event(
 p_event_id uuid, p_full_name text, p_email text, p_consent boolean, p_fingerprint text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  ev public.esc_events%rowtype;
  clean_name text := btrim(coalesce(p_full_name,''));
  clean_email text := lower(btrim(coalesce(p_email,'')));
  attempts_today integer;
  count_registered integer;
begin
  if not p_consent then raise exception 'Communication permission required'; end if;
  if char_length(clean_name) not between 2 and 100 or
    clean_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or
    char_length(clean_email)>254 then raise exception 'Invalid registration data'; end if;
  if char_length(p_fingerprint) < 32 or char_length(p_fingerprint)>128 then
    raise exception 'Invalid request fingerprint'; end if;
  insert into public.esc_registration_attempts(day,fingerprint,attempts)
    values ((now() at time zone 'Europe/Istanbul')::date,p_fingerprint,1)
    on conflict(day,fingerprint) do update set attempts=public.esc_registration_attempts.attempts+1
    returning attempts into attempts_today;
  if attempts_today > 20 then raise exception 'Daily signup limit reached'; end if;
  select * into ev from public.esc_events
    where id=p_event_id and status='planned' and published=true and registration_enabled=true
      and start_at>now() for update;
  if not found then raise exception 'Event is not open for registration'; end if;
  if exists(select 1 from public.esc_event_registrations
            where event_id=p_event_id and email_key=clean_email and status='registered') then
    return jsonb_build_object('ok',true,'status','already_registered');
  end if;
  select count(*) into count_registered from public.esc_event_registrations
    where event_id=p_event_id and status='registered';
  if count_registered>=ev.capacity then raise exception 'Event capacity full'; end if;
  insert into public.esc_event_registrations(event_id,full_name,email,consent,status,source)
  values(p_event_id,clean_name,clean_email,true,'registered','website')
  on conflict (event_id,email_key) do update
    set full_name=excluded.full_name, consent=true, status='registered', updated_at=now();
  return jsonb_build_object('ok',true,'status','registered');
end; $$;
revoke all on function public.esc_register_for_event(uuid,text,text,boolean,text) from public,anon,authenticated;
grant execute on function public.esc_register_for_event(uuid,text,text,boolean,text) to service_role;

-- Generates only future occurrences; a moved or cancelled event keeps its
-- original recurrence date, preventing silent recreation.
create or replace function public.esc_generate_events()
returns integer language plpgsql security definer set search_path = ''
as $$
declare
 rule public.esc_event_rules%rowtype;
 day_date date;
 local_today date := (now() at time zone 'Europe/Istanbul')::date;
 begins timestamptz;
 ends timestamptz;
 inserted integer := 0;
begin
  perform pg_advisory_xact_lock(1941701107);
  for rule in select * from public.esc_event_rules where active=true
  loop
    for day_date in select g::date from generate_series(
      greatest(local_today, rule.start_date)::timestamp,
      least(local_today+rule.horizon_days,coalesce(rule.end_date,local_today+rule.horizon_days))::timestamp,
      interval '1 day') g
    loop
      if extract(dow from day_date)=rule.weekday then
        begins := (day_date + rule.start_time) at time zone 'Europe/Istanbul';
        ends := begins + make_interval(mins=>rule.duration_minutes);
        if begins<=now() then continue; end if;
        if exists(select 1 from public.esc_events e
          where (e.recurrence_id=rule.id and e.original_date=day_date)
          or (e.recurrence_id is null and e.kind=rule.kind and
            (e.start_at at time zone 'Europe/Istanbul')::date=day_date)) then
          continue;
        end if;
        insert into public.esc_events(title,kind,start_at,end_at,venue,
          location_url,meeting_url,capacity,status,published,recurrence_id,original_date)
        values(rule.title,rule.kind,begins,ends,rule.venue,rule.map_url,
          rule.meeting_url,rule.capacity,'planned',rule.published,rule.id,day_date)
        on conflict do nothing;
        if found then inserted := inserted+1; end if;
      end if;
    end loop;
  end loop;
  return inserted;
end; $$;
revoke all on function public.esc_generate_events() from public,anon,authenticated;
grant execute on function public.esc_generate_events() to service_role;

insert into public.esc_event_rules(slug,title,weekday,start_time,duration_minutes,kind,venue,map_url,capacity,active,start_date,horizon_days)
values
 ('esc-monday-online','Online English Speaking Meetup',1,'20:00',90,'online','Google Meet',null,15,true,'2026-10-19',35),
 ('esc-friday-in-person','Friday Speaking Meetup',5,'20:00',120,'in_person','Eryaman 1-2 Coffee LAB',null,15,false,'2026-10-19',35),
 ('esc-sunday-in-person','Sunday Speaking Meetup',0,'18:00',120,'in_person','Eryaman 1-2 Coffee LAB','https://maps.app.goo.gl/7y8SdsCRGYzuSXnr6',15,true,'2026-10-19',35)
on conflict (slug) do nothing;

-- Bring planned events into the new canonical source without changing Sheets.
with planned(event_code,event_date,from_time,to_time,kind,venue,rule_slug) as (
  values
   ('ETK-013','2026-10-18','18:00','20:00','in_person','Eryaman 1-2 Coffee LAB','esc-sunday-in-person'),
   ('ETK-014','2026-10-19','20:00','21:30','online','Google Meet','esc-monday-online'),
   ('ETK-015','2026-10-25','18:00','20:00','in_person','Eryaman 1-2 Coffee LAB','esc-sunday-in-person'),
   ('ETK-016','2026-10-26','20:00','21:30','online','Google Meet','esc-monday-online'),
   ('ETK-017','2026-11-01','18:00','20:00','in_person','Eryaman 1-2 Coffee LAB','esc-sunday-in-person'),
   ('ETK-018','2026-11-02','20:00','21:30','online','Google Meet','esc-monday-online'),
   ('ETK-019','2026-11-08','18:00','20:00','in_person','Eryaman 1-2 Coffee LAB','esc-sunday-in-person'),
   ('ETK-020','2026-11-09','20:00','21:30','online','Google Meet','esc-monday-online'),
   ('ETK-021','2026-11-15','18:00','20:00','in_person','Eryaman 1-2 Coffee LAB','esc-sunday-in-person'),
   ('ETK-022','2026-11-16','20:00','21:30','online','Google Meet','esc-monday-online')
)
insert into public.esc_events(event_code,title,kind,start_at,end_at,venue,capacity,status,published,recurrence_id,original_date,manual_override,
    location_url)
select e.event_code,
   case when e.kind='online' then 'Online English Speaking Meetup' else 'English Speaking Meetup' end,
   e.kind,
   (e.event_date::date+e.from_time::time) at time zone 'Europe/Istanbul',
   (e.event_date::date+e.to_time::time) at time zone 'Europe/Istanbul',
   e.venue,15,'planned',true,
   case when e.event_date='2026-10-18' then null else r.id end,
   case when e.event_date='2026-10-18' then null else e.event_date::date end,
   true,
   case when e.kind='in_person' then 'https://maps.app.goo.gl/7y8SdsCRGYzuSXnr6' else null end
from planned e left join public.esc_event_rules r on r.slug=e.rule_slug
on conflict(event_code) do nothing;

