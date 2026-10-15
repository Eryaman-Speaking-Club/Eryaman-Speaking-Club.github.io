-- ESC email bridge: PostgreSQL search_path='' requires schema-qualified pgcrypto.
-- Security patch 15 October 2026; no keys, recipients, or live email sends here.
-- The bridge remains disabled until an authenticated administrator explicitly configures it.

-- public.esc_configure_email_bridge(text,boolean)
CREATE OR REPLACE FUNCTION public.esc_configure_email_bridge(p_token text, p_enable boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not exists (select 1 from public.esc_admin_profiles where user_id=(select auth.uid()) and active=true and role='super_admin') then raise exception 'Forbidden'; end if;
  if p_token !~ '^[A-Za-z0-9_-]{48,128}$' then raise exception 'Invalid token format'; end if;
  insert into public.esc_email_bridge_config(id,token_hash,enabled,updated_at,updated_by)
  values(true,extensions.digest(p_token,'sha256'),p_enable,now(),(select auth.uid()))
  on conflict(id) do update
  set token_hash=excluded.token_hash,enabled=excluded.enabled,
      updated_at=excluded.updated_at,updated_by=excluded.updated_by;
  return jsonb_build_object('ok',true,'enabled',p_enable);
end; $function$;

-- public.esc_bridge_health(text)
CREATE OR REPLACE FUNCTION public.esc_bridge_health(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare cfg public.esc_email_bridge_config%rowtype;
begin
  select * into cfg from public.esc_email_bridge_config where id=true;
  if not found or p_token is null or
    extensions.digest(p_token,'sha256') is distinct from cfg.token_hash
    then raise exception 'Unauthorized'; end if;
  return jsonb_build_object(
    'configured',true,'enabled',cfg.enabled,
    'waiting',(select count(*) from public.esc_event_notifications
      where status='pending'),
    'sent',(select count(*) from public.esc_event_notifications
      where status='sent'),
    'manual_review',(select count(*) from public.esc_event_notifications
      where status in ('uncertain','failed')),
    'mode','NO_SEND'
  );
end; $function$;

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
     extensions.digest(p_token,'sha256') is distinct from cfg.token_hash
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

-- public.esc_ack_email_delivery(text,bigint,boolean,text)
CREATE OR REPLACE FUNCTION public.esc_ack_email_delivery(p_token text, p_notification_id bigint, p_delivered boolean, p_error_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare cfg public.esc_email_bridge_config%rowtype;
  affected integer;
begin
  select * into cfg from public.esc_email_bridge_config where id=true;
  if not found or p_token is null or
    extensions.digest(p_token,'sha256') is distinct from cfg.token_hash
    then raise exception 'Unauthorized'; end if;
  update public.esc_event_notifications
  set status=case when p_delivered then 'sent' else 'uncertain' end,
      sent_at=case when p_delivered then now() else sent_at end,
      error_note=case when p_delivered then null else left(coalesce(p_error_note,'unknown'),400) end,
      updated_at=now()
  where id=p_notification_id and status='sending';
  get diagnostics affected=row_count;
  return jsonb_build_object('acknowledged',affected=1);
end; $function$;

revoke all on function public.esc_configure_email_bridge(text,boolean) from public,anon;
grant execute on function public.esc_configure_email_bridge(text,boolean) to authenticated;
revoke all on function public.esc_bridge_health(text) from public,anon,authenticated;
grant execute on function public.esc_bridge_health(text) to service_role;
revoke all on function public.esc_claim_email_batch(text,integer) from public,anon,authenticated;
grant execute on function public.esc_claim_email_batch(text,integer) to service_role;
revoke all on function public.esc_ack_email_delivery(text,bigint,boolean,text) from public,anon,authenticated;
grant execute on function public.esc_ack_email_delivery(text,bigint,boolean,text) to service_role;
