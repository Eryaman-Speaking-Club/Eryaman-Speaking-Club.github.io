-- SOURCE SNAPSHOT: applied to ESC Supabase on 28 October 2026.
-- Do not replay against the running project without reviewing migrations.
-- Generated without exposing stored credentials. Secrets stay in Supabase Vault.


-- esc_independent_resend_dispatch_engine_20261028
create extension if not exists pg_net with schema extensions;

create table if not exists private.esc_resend_dispatch_config (
  id boolean primary key default true check(id),
  token_hash bytea not null,
  enabled boolean not null default true,
  active_from timestamptz not null default now(),
  provider_ready boolean not null default false,
  last_checked_at timestamptz,
  last_error text
);
revoke all on private.esc_resend_dispatch_config from public,anon,authenticated;
grant usage on schema private to service_role;
grant select,update on private.esc_resend_dispatch_config to service_role;

do $setup$
begin
  if not exists (select 1 from vault.secrets where name='esc_resend_dispatch_token') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(40),'hex'),
      'esc_resend_dispatch_token',
      'Secret invoked only by ESC Supabase Cron to dispatch independent transactional emails'
    );
  end if;
end $setup$;
insert into private.esc_resend_dispatch_config(id,token_hash,enabled,active_from)
select true,extensions.digest(v.decrypted_secret,'sha256'),true,now()
from vault.decrypted_secrets v where v.name='esc_resend_dispatch_token'
on conflict (id) do nothing;

alter table public.esc_lesson_mail_queue
  add column if not exists provider_email_id text,
  add column if not exists provider_http_status integer;

alter table public.esc_lesson_time_request_mail
  add column if not exists provider_email_id text,
  add column if not exists provider_http_status integer;

alter table public.esc_lesson_time_request_mail
  drop constraint if exists esc_lesson_time_request_mail_status_check;
alter table public.esc_lesson_time_request_mail
  add constraint esc_lesson_time_request_mail_status_check
  check (status in ('pending','sending','sent','failed','uncertain','superseded'));

create or replace function public.esc_resend_dispatch_authorized(p_token text)
returns boolean language sql security invoker set search_path='' as $fn$
  select coalesce((
     select c.enabled and
       c.token_hash = extensions.digest(p_token,'sha256')
     from private.esc_resend_dispatch_config c where c.id=true
  ),false) and p_token is not null and char_length(p_token)=80;
$fn$;

create or replace function public.esc_resend_dispatch_heartbeat(
  p_token text,p_ready boolean,p_problem text default null
) returns boolean language plpgsql security invoker set search_path='' as $fn$
begin
  if not public.esc_resend_dispatch_authorized(p_token) then
    raise exception 'Unauthorized';
  end if;
  update private.esc_resend_dispatch_config
  set provider_ready=coalesce(p_ready,false),
      last_checked_at=now(),
      last_error=case when p_ready then null else left(coalesce(p_problem,'Provider not configured'),180) end
  where id=true;
  return found;
end;
$fn$;

create or replace function public.esc_resend_dispatch_claim(
  p_token text,p_limit integer default 10
) returns jsonb language plpgsql security invoker set search_path='' as $fn$
declare
  rec record;
  result jsonb:='[]'::jsonb;
  remaining integer;
  earliest timestamptz;
begin
  if not public.esc_resend_dispatch_authorized(p_token) then raise exception 'Unauthorized'; end if;
  if p_limit is null or p_limit<1 or p_limit>15 then raise exception 'Invalid limit'; end if;
  select active_from into earliest from private.esc_resend_dispatch_config where id=true;
  perform pg_advisory_xact_lock(1941706690);
  -- Never guess whether a network-timeout email was delivered: manual review only.
  update public.esc_lesson_mail_queue
    set status='uncertain',error_note='Sender stopped after claim; inspect provider before retry',
        updated_at=now()
    where status='sending' and created_at>=earliest and updated_at<now()-interval '30 minutes';
  update public.esc_lesson_time_request_mail
    set status='uncertain',error_note='Sender stopped after claim; inspect provider before retry',
        updated_at=now()
    where status='sending' and created_at>=earliest and updated_at<now()-interval '30 minutes';
  for rec in
    select q.id,q.recipient,q.subject,q.body,q.kind
    from public.esc_lesson_mail_queue q
    join public.esc_lesson_bookings b on b.id=q.booking_id
    where q.status='pending' and q.created_at>=earliest and q.due_at<=now()
    and (
       (q.kind in ('admin_new','student_received') and b.status='requested' and b.start_at>now())
       or (q.kind in ('student_confirmed','reminder_24h','reminder_1h') and b.status='confirmed' and b.start_at>now())
       or (q.kind='student_cancelled' and b.status='cancelled' and q.created_at>now()-interval '48 hours')
    )
    order by case q.kind when 'admin_new' then 1 when 'student_confirmed' then 2
      when 'student_cancelled' then 3 when 'student_received' then 4
      when 'reminder_1h' then 5 else 6 end,q.due_at,q.id
    for update of q skip locked limit p_limit
  loop
    update public.esc_lesson_mail_queue set status='sending',updated_at=now()
      where id=rec.id and status='pending';
    result:=result||jsonb_build_array(jsonb_build_object(
      'queue','lesson','id',rec.id,'recipient',rec.recipient,
      'subject',rec.subject,'body',rec.body,'kind',rec.kind
    ));
  end loop;
  remaining:=p_limit-jsonb_array_length(result);
  if remaining>0 then
    for rec in
      select q.id,q.recipient,q.subject,q.body
      from public.esc_lesson_time_request_mail q
      join public.esc_lesson_time_requests t on t.id=q.request_id
      where q.status='pending' and q.created_at>=earliest
       and t.status='pending'
       and t.preferred_date >= (now() at time zone 'Europe/Istanbul')::date
      order by q.created_at,q.id for update of q skip locked limit remaining
    loop
      update public.esc_lesson_time_request_mail set status='sending',updated_at=now()
      where id=rec.id and status='pending';
      result:=result||jsonb_build_array(jsonb_build_object(
        'queue','alternative','id',rec.id,'recipient',rec.recipient,
        'subject',rec.subject,'body',rec.body,'kind','alternative_time'
      ));
    end loop;
  end if;
  return jsonb_build_object('count',jsonb_array_length(result),'items',result);
end;
$fn$;

create or replace function public.esc_resend_dispatch_ack(
  p_token text,p_queue text,p_id bigint,p_accepted boolean,
  p_provider_id text default null,p_http_status integer default null,
  p_error text default null
) returns boolean language plpgsql security invoker set search_path='' as $fn$
declare updated_count integer;
begin
  if not public.esc_resend_dispatch_authorized(p_token) then raise exception 'Unauthorized'; end if;
  if p_id is null or p_id<1 or p_queue not in ('lesson','alternative') or p_accepted is null then
    raise exception 'Invalid acknowledgment';
  end if;
  if p_queue='lesson' then
    update public.esc_lesson_mail_queue set
      status=case when p_accepted then 'sent' else 'uncertain' end,
      sent_at=case when p_accepted then now() else sent_at end,
      provider_email_id=case when p_accepted then left(coalesce(p_provider_id,''),130) else provider_email_id end,
      provider_http_status=p_http_status,
      error_note=case when p_accepted then null else left(coalesce(p_error,'Provider status unknown'),400) end,
      updated_at=now()
    where id=p_id and status='sending';
  else
    update public.esc_lesson_time_request_mail set
      status=case when p_accepted then 'sent' else 'uncertain' end,
      sent_at=case when p_accepted then now() else sent_at end,
      provider_email_id=case when p_accepted then left(coalesce(p_provider_id,''),130) else provider_email_id end,
      provider_http_status=p_http_status,
      error_note=case when p_accepted then null else left(coalesce(p_error,'Provider status unknown'),400) end,
      updated_at=now()
    where id=p_id and status='sending';
  end if;
  get diagnostics updated_count=row_count;
  return updated_count=1;
end;
$fn$;

revoke all on function public.esc_resend_dispatch_authorized(text) from public,anon,authenticated;
revoke all on function public.esc_resend_dispatch_heartbeat(text,boolean,text) from public,anon,authenticated;
revoke all on function public.esc_resend_dispatch_claim(text,integer) from public,anon,authenticated;
revoke all on function public.esc_resend_dispatch_ack(text,text,bigint,boolean,text,integer,text) from public,anon,authenticated;
grant execute on function public.esc_resend_dispatch_authorized(text) to service_role;
grant execute on function public.esc_resend_dispatch_heartbeat(text,boolean,text) to service_role;
grant execute on function public.esc_resend_dispatch_claim(text,integer) to service_role;
grant execute on function public.esc_resend_dispatch_ack(text,text,bigint,boolean,text,integer,text) to service_role;

-- esc_resend_admin_email_health_20261028
create or replace function public.esc_lesson_email_delivery_overview()
returns jsonb
language sql security invoker set search_path='' as $fn$
  select jsonb_build_object(
    'provider','resend',
    'worker_enabled',coalesce(c.provider_ready,false)
      and c.last_checked_at>now()-interval '8 minutes' and coalesce(c.enabled,false),
    'provider_ready',coalesce(c.provider_ready,false),
    'last_checked_at',c.last_checked_at,
    'provider_problem',c.last_error,
    'pending',
      (select count(*) from public.esc_lesson_mail_queue where status='pending'
       and created_at>=coalesce(c.active_from,now()))+
      (select count(*) from public.esc_lesson_time_request_mail where status='pending'
       and created_at>=coalesce(c.active_from,now())),
    'legacy_pending',
      (select count(*) from public.esc_lesson_mail_queue where status='pending'
       and created_at<coalesce(c.active_from,now()))+
      (select count(*) from public.esc_lesson_time_request_mail where status='pending'
       and created_at<coalesce(c.active_from,now())),
    'accepted_by_provider',
      (select count(*) from public.esc_lesson_mail_queue where status='sent')+
      (select count(*) from public.esc_lesson_time_request_mail where status='sent'),
    'manual_review',
      (select count(*) from public.esc_lesson_mail_queue where status='uncertain')+
      (select count(*) from public.esc_lesson_time_request_mail where status in ('uncertain','failed')),
    'last_accepted_at',
      (select max(sent_at) from (
       select sent_at from public.esc_lesson_mail_queue where status='sent'
       union all
       select sent_at from public.esc_lesson_time_request_mail where status='sent'
      ) accepted)
  )
  from private.esc_resend_dispatch_config c where c.id=true;
$fn$;
revoke all on function public.esc_lesson_email_delivery_overview() from public,anon,authenticated;
grant execute on function public.esc_lesson_email_delivery_overview() to service_role;

-- Active server scheduler: two-minute intervals, no ChatGPT or Gmail account integration.
select cron.schedule('esc-resend-private-lesson-mail','*/2 * * * *',$job$
  select net.http_post(
    url:='https://bshzakigvtyjilolsfjp.supabase.co/functions/v1/esc-lesson-resend',
    headers:=jsonb_build_object('Content-Type','application/json',
      'x-esc-cron-token',(select decrypted_secret from vault.decrypted_secrets
        where name='esc_resend_dispatch_token')),
    body:='{}'::jsonb,timeout_milliseconds:=120000
  );
$job$);
