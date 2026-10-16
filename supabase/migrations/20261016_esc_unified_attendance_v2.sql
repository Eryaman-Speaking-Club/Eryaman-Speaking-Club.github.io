-- ESC unified attendance operations: public schema migration.
-- Attendance remains authoritative in Google Sheets; no participant messages are sent.
-- v2 Apps Script must be installed before web-admin attendance changes are enabled.
-- The credential stays in Apps Script properties, never in this repository.

create table if not exists public.esc_sheet_members (
 member_code text primary key check(member_code ~ '^UYE-[0-9]{3,5}$'),
 full_name text not null check(length(btrim(full_name)) between 2 and 120),
 email text, consent boolean not null default false,
 eligible boolean not null default true,
 synced_at timestamptz not null default now()
);
alter table public.esc_sheet_members enable row level security;
revoke all on public.esc_sheet_members from public,anon;
grant select on public.esc_sheet_members to authenticated;
drop policy if exists "ESC admins read verified member directory" on public.esc_sheet_members;
create policy "ESC admins read verified member directory" on public.esc_sheet_members
 for select to authenticated using ((select public.esc_can_manage_events()));

create table if not exists public.esc_sheet_attendance_actions (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.esc_events(id) on delete cascade,
 member_code text not null references public.esc_sheet_members(member_code),
 operation text not null check(operation in ('add','remove','attended','absent')),
 expected_listed boolean not null,expected_attended boolean not null,
 desired_listed boolean not null,desired_attended boolean not null,
 status text not null default 'pending' check(status in ('pending','applied','conflict')),
 error text,created_by uuid not null,
 created_at timestamptz not null default now(),
 resolved_at timestamptz
);
create unique index if not exists esc_attendance_only_one_pending_per_person
 on public.esc_sheet_attendance_actions(event_id,member_code) where status='pending';
create index if not exists esc_attendance_action_recent
 on public.esc_sheet_attendance_actions(event_id,created_at desc);
alter table public.esc_sheet_attendance_actions enable row level security;
revoke all on public.esc_sheet_attendance_actions from public,anon;
grant select on public.esc_sheet_attendance_actions to authenticated;
drop policy if exists "ESC admins read attendance changes" on public.esc_sheet_attendance_actions;
create policy "ESC admins read attendance changes"
 on public.esc_sheet_attendance_actions for select to authenticated
 using ((select public.esc_can_manage_events()));

alter table public.esc_sheets_sync_config
 add column if not exists client_version integer not null default 1,
 add column if not exists client_seen_at timestamptz,
 add column if not exists attendance_enabled boolean not null default false;

drop function if exists public.esc_sheets_client_checkin(text,integer);

-- public.esc_sheets_push_members(text,jsonb)
CREATE OR REPLACE FUNCTION public.esc_sheets_push_members(p_token text, p_members jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare m jsonb; code text; name_value text; address text; cnt integer;
begin
 perform public.esc_sheets_authorize(p_token,true);
 if p_members is null or jsonb_typeof(p_members)<>'array'
    or jsonb_array_length(p_members)>500 then
  raise exception 'Invalid member directory snapshot';
 end if;
 cnt=jsonb_array_length(p_members);
 if exists(select 1 from jsonb_array_elements(p_members) x
   where coalesce(x->>'member_code','') !~ '^UYE-[0-9]{3,5}$'
     or length(btrim(coalesce(x->>'full_name',''))) not between 2 and 120)
 then raise exception 'Invalid member identifiers or names'; end if;
 if (select count(distinct x->>'member_code') from jsonb_array_elements(p_members) x) <> cnt
 then raise exception 'Duplicate member in directory'; end if;
 for m in select * from jsonb_array_elements(p_members) loop
  code=m->>'member_code';
  name_value=btrim(m->>'full_name');
  address=lower(btrim(coalesce(m->>'email','')));
  if address='' or address !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
   or length(address)>254 then address=null; end if;
  insert into public.esc_sheet_members(member_code,full_name,email,consent,eligible,synced_at)
   values(code,name_value,address,coalesce((m->>'consent')::boolean,false),
    coalesce((m->>'eligible')::boolean,true),now())
  on conflict(member_code) do update set full_name=excluded.full_name,
   email=excluded.email,consent=excluded.consent,
   eligible=excluded.eligible,synced_at=now();
 end loop;
 return jsonb_build_object('ok',true,'members',cnt);
end $function$;

-- public.esc_sheets_client_checkin(text,integer,boolean)
CREATE OR REPLACE FUNCTION public.esc_sheets_client_checkin(p_token text, p_version integer, p_attendance_enabled boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 perform public.esc_sheets_authorize(p_token,true);
 if p_version<1 or p_version>50 then raise exception 'Invalid client version';end if;
 update public.esc_sheets_sync_config
  set client_version=p_version,client_seen_at=now(),
    attendance_enabled=coalesce(p_attendance_enabled,false),
    last_error=null where id=true;
 return jsonb_build_object('ok',true,'client_version',p_version,
  'attendance_enabled',coalesce(p_attendance_enabled,false));
end $function$;

-- public.esc_admin_attendance_bridge_status()
CREATE OR REPLACE FUNCTION public.esc_admin_attendance_bridge_status()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v public.esc_sheets_sync_config%rowtype;
begin
 if not public.esc_can_manage_events() then raise exception 'Forbidden';end if;
 select * into v from public.esc_sheets_sync_config where id=true;
 return jsonb_build_object('configured',v.token_hash is not null,'enabled',coalesce(v.enabled,false),
  'client_version',coalesce(v.client_version,0),'client_seen_at',v.client_seen_at,
  'attendance_enabled',coalesce(v.attendance_enabled,false),
  'ready',coalesce(v.enabled,false) and coalesce(v.attendance_enabled,false) and
    coalesce(v.client_version,0)>=2 and v.client_seen_at>now()-interval '20 minutes',
  'mail_approved',coalesce(v.mail_approved,false),
  'pending',(select count(*) from public.esc_sheet_attendance_actions where status='pending'),
  'conflicts',(select count(*) from public.esc_sheet_attendance_actions where status='conflict'));
end $function$;

-- public.esc_admin_request_attendance(uuid,text,text)
CREATE OR REPLACE FUNCTION public.esc_admin_request_attendance(p_event uuid, p_member_code text, p_operation text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare e public.esc_events%rowtype; m public.esc_sheet_members%rowtype;
 v public.esc_sheets_sync_config%rowtype;
 s public.esc_sheet_roster%rowtype;
 old_listed boolean;old_attended boolean;want_listed boolean;want_attended boolean;
 request_id uuid;
begin
 if not public.esc_can_manage_events() or (select auth.uid()) is null
 then raise exception 'Forbidden';end if;
 select * into v from public.esc_sheets_sync_config where id=true;
 if v.id is null or v.enabled<>true or v.attendance_enabled<>true or v.client_version<2
    or v.client_seen_at is null or v.client_seen_at<now()-interval '20 minutes' then
  raise exception 'Sheets senkronizasyon kodu v2 henüz çevrimiçi değil. Güncel Apps Script kurulumunu tamamlayın.';
 end if;
 if p_operation not in ('add','remove','attended','absent') then
  raise exception 'Unknown attendance operation';end if;
 select * into e from public.esc_events where id=p_event for share;
 if not found then raise exception 'Event not found';end if;
 if e.status='cancelled' then raise exception 'İptal edilen etkinliğin katılımı değiştirilemez';end if;
 if e.end_at<now()-interval '30 days' then raise exception '30 günden eski etkinlikler yalnızca arşivden izlenebilir';end if;
 select * into m from public.esc_sheet_members where member_code=p_member_code;
 if not found then raise exception 'Üye Google Sheets ana listesinde bulunamadı';end if;
 if not m.eligible and p_operation in ('add','attended') then
  raise exception 'Bu üye katılım için uygun değil';end if;
 perform pg_advisory_xact_lock(hashtext(p_event::text||':'||p_member_code)::bigint);
 if exists(select 1 from public.esc_sheet_attendance_actions
   where event_id=p_event and member_code=p_member_code and status='pending') then
  raise exception 'Bu üye için önceki Sheets değişikliği henüz tamamlanmadı';
 end if;
 select * into s from public.esc_sheet_roster
  where event_id=p_event and member_code=p_member_code;
 old_listed=coalesce(s.listed,false); old_attended=coalesce(s.attended,false);
 want_listed=case when p_operation='remove' then false else true end;
 want_attended=case when p_operation='attended' then true else false end;
 if p_operation='add' and old_listed then want_attended=old_attended;end if;
 -- Before event end, switching from attended to unmarked attendance is a reset;
 -- only after event end is the same state reported as no_show.
 if old_listed=want_listed and old_attended=want_attended then
  return jsonb_build_object('queued',false,'already_current',true);
 end if;
 insert into public.esc_sheet_attendance_actions(event_id,member_code,operation,
  expected_listed,expected_attended,desired_listed,desired_attended,created_by)
  values(p_event,p_member_code,p_operation,old_listed,old_attended,
   want_listed,want_attended,(select auth.uid())) returning id into request_id;
 return jsonb_build_object('queued',true,'request_id',request_id,
  'message','Sheets senkronizasyonu için sıraya alındı');
end $function$;

-- public.esc_sheets_pull_attendance(text)
CREATE OR REPLACE FUNCTION public.esc_sheets_pull_attendance(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare rows jsonb;
begin
 perform public.esc_sheets_authorize(p_token,true);
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',a.id,'event_code',e.event_code,'kind',e.kind,'member_code',a.member_code,
  'expected_listed',a.expected_listed,'expected_attended',a.expected_attended,
  'desired_listed',a.desired_listed,'desired_attended',a.desired_attended
 ) order by a.created_at),'[]'::jsonb) into rows
 from (select * from public.esc_sheet_attendance_actions
   where status='pending' order by created_at limit 100) a
 join public.esc_events e on e.id=a.event_id;
 return jsonb_build_object('items',rows);
end $function$;

-- public.esc_sheets_ack_attendance(text,jsonb)
CREATE OR REPLACE FUNCTION public.esc_sheets_ack_attendance(p_token text, p_results jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare item jsonb;a public.esc_sheet_attendance_actions%rowtype;
 new_status text;why text;completed int:=0;conflict_count int:=0;
 actual public.esc_sheet_roster%rowtype;
begin
 perform public.esc_sheets_authorize(p_token,true);
 if p_results is null or jsonb_typeof(p_results)<>'array' or jsonb_array_length(p_results)>100
 then raise exception 'Invalid attendance acknowledgement'; end if;
 for item in select * from jsonb_array_elements(p_results) loop
  if coalesce(item->>'id','') !~ '^[0-9a-fA-F-]{36}$'
   or item->>'status' not in ('applied','conflict')
  then raise exception 'Invalid acknowledgement item';end if;
  select * into a from public.esc_sheet_attendance_actions
   where id=(item->>'id')::uuid and status='pending' for update;
  if not found then continue;end if;
  new_status=item->>'status';
  why=left(coalesce(item->>'reason',''),220);
  if new_status='applied' then
   select * into actual from public.esc_sheet_roster
    where event_id=a.event_id and member_code=a.member_code;
   if not found or actual.listed is distinct from a.desired_listed
      or actual.attended is distinct from a.desired_attended then
    -- Apps Script has not yet pushed the reconciled snapshot.
    continue;
   end if;
   completed=completed+1;
  else
   conflict_count=conflict_count+1;
  end if;
  update public.esc_sheet_attendance_actions
   set status=new_status,error=nullif(why,''),resolved_at=now()
   where id=a.id;
 end loop;
 return jsonb_build_object('ok',true,'applied',completed,'conflicts',conflict_count);
end $function$;

-- public.esc_sheets_push_roster(text,text,text,jsonb,boolean)
CREATE OR REPLACE FUNCTION public.esc_sheets_push_roster(p_token text, p_code text, p_kind text, p_members jsonb, p_confirm_empty boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare e public.esc_events%rowtype; m jsonb; nm text; addr text;
 member text; nlisted integer; prior_count integer;
 eligible integer :=0; skipped integer:=0;
 allowed_email boolean; joined boolean; first boolean; person_ok boolean;
begin
 perform public.esc_sheets_authorize(p_token,true);
 if p_code !~ '^ETK-[0-9]{3,5}$'
    or p_kind not in ('online','in_person')
    or jsonb_typeof(p_members)<>'array' or jsonb_array_length(p_members)>500
 then raise exception 'Invalid event roster payload'; end if;
 select * into e from public.esc_events where event_code=p_code;
 if not found then return jsonb_build_object('ok',false,'reason','event_not_found'); end if;
 if e.kind<>p_kind then
   return jsonb_build_object('ok',false,'reason','wrong_roster_tab','expected',e.kind); end if;
 perform pg_advisory_xact_lock(hashtext(p_code)::bigint);
 nlisted=jsonb_array_length(p_members);
 select count(*) into prior_count from public.esc_sheet_roster
  where event_id=e.id and listed;
 if nlisted=0 and prior_count>0 and not p_confirm_empty then
   return jsonb_build_object('ok',false,'reason','empty_snapshot_requires_confirmation',
     'previous',prior_count);end if;
 -- Preflight complete payload: invalid/duplicate member ids abort the entire event snapshot.
 if exists(select 1 from jsonb_array_elements(p_members) it
   where (it->>'member_code') !~ '^UYE-[0-9]{3,5}$'
     or char_length(btrim(coalesce(it->>'full_name',''))) not between 2 and 100)
 then raise exception 'Invalid name or member code in roster'; end if;
 if (select count(distinct it->>'member_code') from jsonb_array_elements(p_members) it)<>nlisted
 then raise exception 'Duplicate member in roster snapshot';end if;
 update public.esc_sheet_roster set listed=false,synced_at=now()
  where event_id=e.id and listed;
 for m in select * from jsonb_array_elements(p_members) loop
   member=m->>'member_code';
   nm=btrim(m->>'full_name');
   addr=lower(btrim(coalesce(m->>'email','')));
   if addr='' or addr !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      or char_length(addr)>254 then addr=null;end if;
   joined=coalesce((m->>'attended')::boolean,false);
   first=coalesce((m->>'first_visit')::boolean,false);
   person_ok=coalesce((m->>'member_eligible')::boolean,true);
   allowed_email=coalesce((m->>'consent')::boolean,false);
   insert into public.esc_sheet_roster
    (event_id,member_code,full_name,email,consent,member_eligible,
      listed,attended,first_visit,sheet_row,synced_at)
   values(e.id,member,nm,addr,allowed_email,person_ok,
    true,joined,first,nullif(m->>'sheet_row','')::integer,now())
   on conflict(event_id,member_code) do update set
    full_name=excluded.full_name,email=excluded.email,consent=excluded.consent,
    member_eligible=excluded.member_eligible,listed=true,
    attended=excluded.attended,first_visit=excluded.first_visit,
    sheet_row=excluded.sheet_row,synced_at=now();
   if addr is not null and allowed_email and person_ok then
     eligible:=eligible+1;
     insert into public.esc_event_registrations
      (event_id,full_name,email,consent,status,first_visit,source)
     values(e.id,nm,addr,true,case when joined then 'attended' when e.end_at<=now() and e.status<>'cancelled' then 'no_show' else 'registered' end,
      first,'legacy')
     on conflict(event_id,email_key) do update set
      full_name=excluded.full_name,consent=true,status=excluded.status,
      first_visit=excluded.first_visit,updated_at=now()
      where public.esc_event_registrations.status in ('registered','attended','no_show','cancelled');
   else
     skipped:=skipped+1;
   end if;
 end loop;
 -- Previously sheet-imported attendees no longer marked Listede: cancel only these;
 -- website registrations remain intact but are still excluded by the sheet-roster email gate.
 update public.esc_event_registrations r set
   status='cancelled',updated_at=now()
 where r.event_id=e.id and r.source='legacy'
   and r.status in ('registered','attended','no_show')
   and not exists(
     select 1 from public.esc_sheet_roster s
     where s.event_id=e.id and s.listed and s.consent and s.member_eligible
       and s.email is not null and lower(s.email)=r.email_key
   );
 insert into public.esc_sheet_roster_snapshots(event_id,checked_at,listed_count,eligible_count,skipped_count)
 values(e.id,now(),nlisted,eligible,skipped)
 on conflict(event_id) do update set
  checked_at=now(),listed_count=excluded.listed_count,
  eligible_count=excluded.eligible_count,skipped_count=excluded.skipped_count;
 update public.esc_sheets_sync_config set last_push_at=now(),last_error=null where id=true;
 return jsonb_build_object('ok',true,'event_code',p_code,
   'listed',nlisted,'eligible',eligible,'skipped',skipped,
   'emails_sent',0);
end $function$;

-- public.esc_guard_event_kind_with_attendance()
CREATE OR REPLACE FUNCTION public.esc_guard_event_kind_with_attendance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if new.kind is distinct from old.kind and (
  exists(select 1 from public.esc_sheet_roster s
    where s.event_id=old.id and s.listed)
  or exists(select 1 from public.esc_event_registrations r
    where r.event_id=old.id and r.status in ('registered','attended','no_show'))
 ) then
  raise exception 'Bu etkinlikte katılımcı var. Online/yüz yüze türünü doğrudan değiştirmek eski Sheets katılım bloklarını ayırır. Önce kayıtları güvenli biçimde taşıyın.';
 end if;
 return new;
end $function$;

revoke all on function public.esc_sheets_push_members(text,jsonb) from public,anon,authenticated;
revoke all on function public.esc_sheets_client_checkin(text,integer,boolean) from public,anon,authenticated;
revoke all on function public.esc_sheets_pull_attendance(text) from public,anon,authenticated;
revoke all on function public.esc_sheets_ack_attendance(text,jsonb) from public,anon,authenticated;
grant execute on function public.esc_sheets_push_members(text,jsonb) to service_role;
grant execute on function public.esc_sheets_client_checkin(text,integer,boolean) to service_role;
grant execute on function public.esc_sheets_pull_attendance(text) to service_role;
grant execute on function public.esc_sheets_ack_attendance(text,jsonb) to service_role;

revoke all on function public.esc_admin_attendance_bridge_status() from public,anon;
revoke all on function public.esc_admin_request_attendance(uuid,text,text) from public,anon;
grant execute on function public.esc_admin_attendance_bridge_status() to authenticated;
grant execute on function public.esc_admin_request_attendance(uuid,text,text) to authenticated;
drop trigger if exists esc_event_kind_attendance_guard on public.esc_events;
create trigger esc_event_kind_attendance_guard
 before update of kind on public.esc_events for each row
 execute function public.esc_guard_event_kind_with_attendance();
