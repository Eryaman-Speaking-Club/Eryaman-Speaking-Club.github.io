-- ESC event stability and safe notification intent management.
-- Snapshot of tested production function definitions, 15 October 2026.
-- Applies atomically; contains NO live participant addresses or secrets.
--
-- Guarantees:
-- (1) At most one auto-generated occurrence per recurrence rule/ISO week.
-- (2) A weekly rule may synchronize its unmodified, unregistered upcoming events.
-- (3) Publishing/unpublishing cannot produce a false schedule-change email.
-- (4) A real schedule change deduplicates by the originating audit record.
-- (5) Superseded pending notifications are not uncertain deliveries.
-- (6) A sent or uncertain reminder/thanks is not automatically sent a second time.
-- (7) A hidden event is not eligible for welcome/reminder/change mail.

alter table public.esc_event_audit
 drop constraint if exists esc_event_audit_kind_check;
alter table public.esc_event_audit
 add constraint esc_event_audit_kind_check
 check (kind in ('created','rescheduled','changed','cancelled','completed','restored','administrative'));

alter table public.esc_event_notifications
 drop constraint if exists esc_event_notifications_status_check;
alter table public.esc_event_notifications
 add constraint esc_event_notifications_status_check
 check (status in ('pending','sending','sent','failed','uncertain','superseded'));
alter table public.esc_event_notifications
 add column if not exists source_audit_id bigint references public.esc_event_audit(id);
create unique index if not exists esc_event_notifications_audit_unique
 on public.esc_event_notifications(registration_id,kind,source_audit_id)
 where source_audit_id is not null;

-- public.esc_generate_events()
CREATE OR REPLACE FUNCTION public.esc_generate_events()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
          where (e.recurrence_id=rule.id and e.original_date between date_trunc('week',day_date::timestamp)::date and (date_trunc('week',day_date::timestamp)::date + 6))
          or (e.kind=rule.kind and
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
end; $function$;

-- public.esc_admin_save_weekly_rule(uuid,jsonb,boolean)
CREATE OR REPLACE FUNCTION public.esc_admin_save_weekly_rule(p_rule_id uuid, p_patch jsonb, p_apply_future boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  r public.esc_event_rules%rowtype;
  event_row public.esc_events%rowtype;
  changed_count integer := 0;
  generated_count integer := 0;
  skipped_manual integer := 0;
  skipped_registered integer := 0;
  skipped_past integer := 0;
  skipped_collision integer := 0;
  target_day date;
  target_start timestamptz;
  target_end timestamptz;
begin
  if not public.esc_can_manage_events() then raise exception 'Yetkisiz takvim işlemi'; end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' or
    not (p_patch ?& array[
      'title','weekday','start_time','duration_minutes','venue','capacity',
      'meeting_url','map_url','published','active','horizon_days'
    ]) then
    raise exception 'Eksik veya geçersiz haftalık program verisi';
  end if;
  if exists(select 1 from jsonb_object_keys(p_patch) as x(key)
      where x.key not in ('title','weekday','start_time','duration_minutes',
        'venue','capacity','meeting_url','map_url','published','active','horizon_days'))
    then raise exception 'Bilinmeyen haftalık program alanı';
  end if;
  perform pg_advisory_xact_lock(1941701107);
  perform 1 from public.esc_event_rules where id=p_rule_id for update;
  if not found then raise exception 'Haftalık program bulunamadı'; end if;

  update public.esc_event_rules
  set title=btrim(p_patch->>'title'),
      weekday=(p_patch->>'weekday')::smallint,
      start_time=(p_patch->>'start_time')::time,
      duration_minutes=(p_patch->>'duration_minutes')::integer,
      venue=btrim(p_patch->>'venue'),
      capacity=(p_patch->>'capacity')::integer,
      meeting_url=nullif(btrim(coalesce(p_patch->>'meeting_url','')),''),
      map_url=nullif(btrim(coalesce(p_patch->>'map_url','')),''),
      published=(p_patch->>'published')::boolean,
      active=(p_patch->>'active')::boolean,
      horizon_days=(p_patch->>'horizon_days')::integer,
      updated_by=(select auth.uid()),
      updated_at=now()
  where id=p_rule_id returning * into r;

  if coalesce(p_apply_future,false) then
    for event_row in
      select e.*
      from public.esc_events e
      where e.recurrence_id=r.id and e.start_at>now()
        and e.status in ('planned','draft') and e.original_date is not null
      order by e.start_at,e.id
      for update
    loop
      if event_row.manual_override then
        skipped_manual:=skipped_manual+1;
        continue;
      end if;
      if exists(select 1 from public.esc_event_registrations reg
                where reg.event_id=event_row.id) then
        skipped_registered:=skipped_registered+1;
        continue;
      end if;

      -- Disabling a weekly rule hides its untouched, unregistered future events.
      if not r.active then
        if (event_row.status,event_row.published,event_row.registration_enabled)
           is distinct from ('draft',false,false) then
          update public.esc_events set status='draft',
            published=false,registration_enabled=false
            where id=event_row.id;
          -- The trigger marks admin edits as manual; this is automated rule sync.
          update public.esc_events set manual_override=false where id=event_row.id;
          changed_count:=changed_count+1;
        end if;
        continue;
      end if;

      -- Map old and new weekdays to the same ISO (Mon-Sun) calendar week,
      -- instead of adding a second event in that week.
      target_day:=date_trunc('week',event_row.original_date::timestamp)::date +
        ((r.weekday::integer+6)%7);
      if target_day<r.start_date or (r.end_date is not null and target_day>r.end_date) then
        skipped_past:=skipped_past+1;
        continue;
      end if;
      target_start:=(target_day+r.start_time) at time zone 'Europe/Istanbul';
      target_end:=target_start+make_interval(mins=>r.duration_minutes);
      if target_start<=now() then
        skipped_past:=skipped_past+1;
        continue;
      end if;
      if exists(select 1 from public.esc_events other
          where other.id<>event_row.id and other.kind=r.kind
            and (other.start_at at time zone 'Europe/Istanbul')::date=target_day
            and other.status in ('planned','draft')) then
        skipped_collision:=skipped_collision+1;
        continue;
      end if;

      if (event_row.title,event_row.kind,event_row.start_at,event_row.end_at,
          event_row.venue,event_row.capacity,event_row.published,
          event_row.registration_enabled,event_row.meeting_url,
          event_row.location_url,event_row.status)
          is distinct from
          (r.title,r.kind,target_start,target_end,r.venue,r.capacity,
          r.published,r.published,r.meeting_url,r.map_url,'planned') then
        update public.esc_events
          set title=r.title,kind=r.kind,
              start_at=target_start,end_at=target_end,
              venue=r.venue,capacity=r.capacity,
              location_url=r.map_url,meeting_url=r.meeting_url,
              status='planned',published=r.published,
              registration_enabled=r.published
          where id=event_row.id;
        update public.esc_events set manual_override=false where id=event_row.id;
        changed_count:=changed_count+1;
      end if;
    end loop;
  end if;

  if r.active then generated_count:=public.esc_generate_events(); end if;

  return jsonb_build_object(
    'saved',true,'updated',changed_count,'created',generated_count,
    'protected_manual',skipped_manual,'protected_registered',skipped_registered,
    'skipped_past',skipped_past,'skipped_collision',skipped_collision,
    'future_sync_enabled',coalesce(p_apply_future,false)
  );
end $function$;

-- public.esc_event_audit_trg()
CREATE OR REPLACE FUNCTION public.esc_event_audit_trg()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare k text;
begin
  if tg_op = 'INSERT' then k := 'created';
  elsif old.revision = new.revision then return new;
  elsif old.status <> 'cancelled' and new.status = 'cancelled' then k := 'cancelled';
  elsif new.status = 'completed' then k := 'completed';
  elsif old.status = 'cancelled' and new.status = 'planned' then k := 'restored';
  elsif (old.start_at,old.end_at) is distinct from (new.start_at,new.end_at) then k := 'rescheduled';
  elsif (old.title,old.venue,old.kind,old.meeting_url,old.location_url)
    is distinct from (new.title,new.venue,new.kind,new.meeting_url,new.location_url)
    then k := 'changed';
  else k := 'administrative'; end if;
  insert into public.esc_event_audit(event_id,revision,kind,old_data,new_data,actor)
  values(new.id,new.revision,k,
    case when tg_op = 'INSERT' then null else jsonb_build_object('start_at',old.start_at,
      'end_at',old.end_at,'venue',old.venue,'status',old.status,'kind',old.kind) end,
    jsonb_build_object('start_at',new.start_at,'end_at',new.end_at,'venue',new.venue,
      'status',new.status,'kind',new.kind), (select auth.uid()));
  return new;
end;
$function$;

-- public.esc_prepare_event_notifications()
CREATE OR REPLACE FUNCTION public.esc_prepare_event_notifications()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  queued_reminders integer := 0;
  queued_changes integer := 0;
  queued_welcome integer := 0;
  queued_thanks integer := 0;
  suppressed integer := 0;
begin
  perform pg_advisory_xact_lock(1941701108);
  -- Stop pending notifications when status, RSVP or revision changed.
  update public.esc_event_notifications n
  set status = 'superseded',
      error_note = 'Superseded before sending: event change, consent, RSVP or elapsed time',
      updated_at = now()
  from public.esc_events e, public.esc_event_registrations r
  where n.event_id=e.id and n.registration_id=r.id
    and r.event_id=e.id and n.status='pending'
    and (
      not r.consent
      or (n.kind in ('welcome','reminder','change') and r.status <> 'registered')
      or (n.kind='welcome' and (e.status <> 'planned' or e.start_at<=now()))
      or (n.kind='reminder' and
        (e.status <> 'planned' or e.start_at<=now() or n.event_revision<>e.revision))
      or (n.kind='change' and (e.status <> 'planned' or e.start_at<=now()
         or n.source_audit_id is null or exists(select 1 from public.esc_event_audit newer
          where newer.event_id=e.id and newer.kind in ('rescheduled','changed','cancelled','restored')
            and newer.id>n.source_audit_id)))
      or (n.kind='cancelled' and (e.status <> 'cancelled' or e.start_at<=now()
         or n.source_audit_id is null or exists(select 1 from public.esc_event_audit newer
          where newer.event_id=e.id and newer.kind in ('rescheduled','changed','cancelled','restored')
            and newer.id>n.source_audit_id)))
      or (n.kind='thanks' and (r.status <> 'attended' or not r.first_visit
         or e.status <> 'completed' or e.end_at+interval '25 hours'<=now()))
    );
  get diagnostics suppressed = row_count;

  -- Every consented current event participant gets a reminder at 24h prior,
  -- not limited to people attending for the first time.
  with inserted as (
    insert into public.esc_event_notifications(event_id,registration_id,kind,event_revision)
    select e.id,r.id,'reminder',e.revision
    from public.esc_events e
    join public.esc_event_registrations r on r.event_id=e.id
    where e.status='planned' and e.published=true
      and e.start_at > now() and e.start_at <= now()+interval '24 hours'
      and r.status='registered' and r.consent=true
      -- One accepted, uncertain or manually failed reminder per attendee/event.
      and not exists(select 1 from public.esc_event_notifications prior
        where prior.event_id=e.id and prior.registration_id=r.id
          and prior.kind='reminder' and prior.status in ('sent','sending','uncertain','failed'))
    on conflict do nothing returning 1
  ) select count(*) into queued_reminders from inserted;

  -- Source 'website' only: the legacy archive and admin-entered records
  -- never automatically receive a new-member welcome.
  with inserted as (
    insert into public.esc_event_notifications(event_id,registration_id,kind,event_revision)
    select e.id,r.id,'welcome',1
    from public.esc_event_registrations r
    join public.esc_events e on e.id=r.event_id
    where r.source='website' and r.consent and r.status='registered'
      and e.status='planned' and e.published=true and e.start_at>now()
      and r.created_at >= '2026-10-14 00:00:00+03:00'::timestamptz
    on conflict do nothing returning 1
  ) select count(*) into queued_welcome from inserted;

  -- Existing registrants are told of meaningful changes to their event
  -- only when they registered before the change happened.
  with audit as (
    select distinct on(a.event_id)
      a.event_id,a.id audit_id,a.revision,a.kind,a.created_at
    from public.esc_event_audit a
    where a.kind in ('rescheduled','changed','cancelled','restored')
    order by a.event_id,a.revision desc,a.id desc
  ), inserted as (
    insert into public.esc_event_notifications
      (event_id,registration_id,kind,event_revision,source_audit_id)
    select e.id,r.id,
      case when e.status='cancelled' then 'cancelled' else 'change' end,
      a.revision,a.audit_id
    from audit a
    join public.esc_events e on e.id=a.event_id
    join public.esc_event_registrations r on r.event_id=e.id
    where r.consent and r.status='registered'
      and r.created_at < a.created_at and e.start_at>now()
      and ((e.status='cancelled' and a.kind='cancelled')
        or (e.status='planned' and e.published=true
          and a.kind in ('rescheduled','changed','restored')))
    on conflict do nothing returning 1
  ) select count(*) into queued_changes from inserted;

  -- Thank only confirmed first-time attendees after event completion.
  with inserted as (
    insert into public.esc_event_notifications(event_id,registration_id,kind,event_revision)
    select e.id,r.id,'thanks',e.revision
    from public.esc_events e
    join public.esc_event_registrations r on r.event_id=e.id
    where e.status='completed' and e.end_at+interval '1 hour' <= now()
      and e.end_at+interval '25 hours'>now()
      and r.status='attended' and r.first_visit and r.consent
      and not exists(select 1 from public.esc_event_notifications prior
        where prior.event_id=e.id and prior.registration_id=r.id
          and prior.kind='thanks' and prior.status in ('sent','sending','uncertain','failed'))
    on conflict do nothing returning 1
  ) select count(*) into queued_thanks from inserted;

  return jsonb_build_object(
    'reminders',queued_reminders,'welcomes',queued_welcome,
    'changes',queued_changes,'thanks',queued_thanks,'invalidated',suppressed,
    'mode','PREPARE_ONLY_NO_EMAIL_DELIVERY'
  );
end $function$;

-- public.esc_claim_email_batch(text,integer)
CREATE OR REPLACE FUNCTION public.esc_claim_email_batch(p_token text, p_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare cfg public.esc_email_bridge_config%rowtype;
  rec record;
  items jsonb := '[]'::jsonb;
  local_date text;
  local_time text;
  old_date text;
  old_time text;
  old_venue text;
  kind_name text;
  s text;
  b text;
  tem record;
  first_name text;
  meeting_detail text;
begin
  select * into cfg from public.esc_email_bridge_config where id=true;
  if not found or not cfg.enabled or p_token is null or
     digest(p_token,'sha256') is distinct from cfg.token_hash
     then raise exception 'Unauthorized'; end if;
  if p_limit not between 1 and 35 then raise exception 'Limit out of bounds'; end if;
  perform pg_advisory_xact_lock(1941701110);

  -- When a sender crashes mid-delivery we NEVER silently resend.
  update public.esc_event_notifications
  set status='uncertain',error_note='Sender timed out; manual review before retry',
      updated_at=now()
  where status='sending' and updated_at<now()-interval '45 minutes';

  for rec in
    select n.id notification_id,n.kind notification_kind,n.event_revision,
      e.id event_id,e.event_code,e.title,e.kind event_kind,e.start_at,e.end_at,
      e.venue,e.location_url,e.meeting_url,e.status event_status,e.revision,
      r.email,r.full_name,r.first_visit,r.created_at,
      a.old_data
    from public.esc_event_notifications n
    join public.esc_events e on e.id=n.event_id
    join public.esc_event_registrations r on r.id=n.registration_id
    left join public.esc_event_audit a on a.id=n.source_audit_id and a.event_id=e.id
    where n.status='pending' and r.consent=true
      and (
        (n.kind='welcome' and n.event_revision=1 and
          r.status='registered' and r.source='website' and e.status='planned'
          and e.published=true and e.start_at>now())
        or (n.kind='reminder' and r.status='registered' and e.status='planned'
          and e.published=true and e.start_at>now() and n.event_revision=e.revision)
        or (n.kind='change' and r.status='registered' and e.status='planned'
          and e.published=true and e.start_at>now() and n.source_audit_id is not null
          and not exists(select 1 from public.esc_event_audit newer
           where newer.event_id=e.id and newer.kind in ('rescheduled','changed','cancelled','restored')
             and newer.id>n.source_audit_id))
        or (n.kind='cancelled' and r.status='registered' and e.status='cancelled'
          and n.source_audit_id is not null and e.start_at>now()
          and not exists(select 1 from public.esc_event_audit newer
           where newer.event_id=e.id and newer.kind in ('rescheduled','changed','cancelled','restored')
             and newer.id>n.source_audit_id))
        or (n.kind='thanks' and r.status='attended' and r.first_visit and
          e.status='completed' and e.end_at+interval '25 hours'>now())
      )
    order by case n.kind when 'cancelled' then 1 when 'change' then 2
      when 'reminder' then 3 when 'welcome' then 4 else 5 end,
      n.created_at
    for update of n skip locked
    limit p_limit
  loop
    kind_name := case
       when rec.notification_kind='reminder' and rec.event_kind='in_person' then 'reminder_in_person'
       when rec.notification_kind='reminder' and rec.event_kind='online' then 'reminder_online'
       else rec.notification_kind end;
    select subject,body,enabled into tem from public.esc_event_email_templates
      where kind=kind_name;
    if not found or not tem.enabled then continue; end if;
    s := tem.subject;
    b := tem.body;
    first_name := split_part(btrim(rec.full_name),' ',1);
    local_date := to_char(rec.start_at at time zone 'Europe/Istanbul','DD.MM.YYYY');
    local_time := to_char(rec.start_at at time zone 'Europe/Istanbul','HH24:MI')||
      '–'||to_char(rec.end_at at time zone 'Europe/Istanbul','HH24:MI');
    old_date := coalesce(to_char((rec.old_data->>'start_at')::timestamptz
      at time zone 'Europe/Istanbul','DD.MM.YYYY'),'—');
    old_time := coalesce(to_char((rec.old_data->>'start_at')::timestamptz
      at time zone 'Europe/Istanbul','HH24:MI'),'—');
    old_venue := coalesce(rec.old_data->>'venue','—');
    meeting_detail := coalesce(nullif(rec.meeting_url,''),'Google Meet bağlantısı buluşmadan önce paylaşılacaktır.');
    b := replace(b,'{{ad}}',first_name);
    b := replace(b,'{{tarih}}',local_date);
    b := replace(b,'{{saat}}',local_time);
    b := replace(b,'{{mekan}}',rec.venue);
    b := replace(b,'{{tur}}',case when rec.event_kind='online' then 'Online' else 'Yüz yüze' end);
    b := replace(b,'{{etkinlik}}',rec.event_code);
    b := replace(b,'{{link}}',meeting_detail);
    b := replace(b,'{{eski_tarih}}',old_date);
    b := replace(b,'{{eski_saat}}',old_time);
    b := replace(b,'{{eski_mekan}}',old_venue);
    s := replace(s,'{{ad}}',first_name);
    s := replace(s,'{{tarih}}',local_date);
    s := replace(s,'{{saat}}',local_time);
    s := replace(s,'{{mekan}}',rec.venue);
    s := replace(s,'{{etkinlik}}',rec.event_code);
    s := replace(s,'{{tur}}',case when rec.event_kind='online' then 'Online' else 'Yüz yüze' end);
    update public.esc_event_notifications set
      status='sending', updated_at=now()
    where id=rec.notification_id;
    items := items || jsonb_build_array(jsonb_build_object(
      'id',rec.notification_id,'email',rec.email,
      'subject',s,'body',b,'kind',rec.notification_kind,
      'event_code',rec.event_code,'revision',rec.event_revision,
      'event_start_at',rec.start_at
    ));
  end loop;
  return jsonb_build_object('items',items,'count',jsonb_array_length(items));
end; $function$;

revoke all on function public.esc_admin_save_weekly_rule(uuid,jsonb,boolean) from public,anon;
grant execute on function public.esc_admin_save_weekly_rule(uuid,jsonb,boolean) to authenticated;
-- These are internal queue processors, not callable by ordinary visitors.
revoke all on function public.esc_prepare_event_notifications() from public,anon,authenticated;
grant execute on function public.esc_prepare_event_notifications() to service_role;
revoke all on function public.esc_claim_email_batch(text,integer) from public,anon,authenticated;
grant execute on function public.esc_claim_email_batch(text,integer) to service_role;
