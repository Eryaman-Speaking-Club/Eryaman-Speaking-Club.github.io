-- 2026-10-16: fix admin login by preventing write-based rate limiting
-- inside PostgREST read-only RPC transactions. This preserves
-- rate limiting for mutating requests, login auth, and RLS.
-- Reproduced SQLSTATE 25006 before fix; verified read-only RPC and
-- write-capable rate limit both work afterward.

CREATE OR REPLACE FUNCTION esc_internal.check_api_request()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_method text := upper(coalesce(current_setting('request.method', true), ''));
  v_path text := ltrim(coalesce(current_setting('request.path', true), ''), '/');
  v_headers jsonb := '{}'::jsonb;
  v_claims jsonb := '{}'::jsonb;
  v_role text := '';
  v_ip text := '';
  v_actor text := '';
  v_limit integer := 0;
  v_bucket timestamptz;
  v_hits integer;
begin
  if v_method not in ('POST','PUT','PATCH','DELETE') then
    return;
  end if;

  -- PostgREST executes read-only RPCs (including POST for STABLE functions)
  -- in a read-only transaction. Never attempt the INSERT-based rate limit
  -- from those queries: they cannot write, and previously broke admin login.
  -- Write-capable mutation requests still use the existing limit below.
  if current_setting('transaction_read_only', true) = 'on' then
    return;
  end if;

  begin
    v_headers := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  exception when others then
    v_headers := '{}'::jsonb;
  end;

  begin
    v_claims := coalesce(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb,
      nullif(current_setting('request.jwt', true), '')::jsonb,
      '{}'::jsonb
    );
  exception when others then
    v_claims := '{}'::jsonb;
  end;

  v_role := coalesce(v_claims->>'role', current_user, '');

  if v_role = 'service_role' then
    return;
  end if;

  v_ip := trim(split_part(coalesce(v_headers->>'x-forwarded-for',''), ',', 1));

  if v_role = 'anon' then
    if v_ip = '' then
      return;
    end if;
    v_actor := 'anon:' || encode(extensions.digest(v_ip, 'sha256'), 'hex');

    if v_path = 'rpc/edu_join_class' then
      v_limit := 120;
    elsif v_path = 'rpc/edu_submit_result' then
      v_limit := 1500;
    elsif v_path = 'site_analytics' then
      v_limit := 180;
    else
      v_limit := 600;
    end if;
  else
    v_actor := 'auth:' || coalesce(auth.uid()::text, 'unknown');
    if v_ip <> '' then
      v_actor := v_actor || ':' || encode(extensions.digest(v_ip, 'sha256'), 'hex');
    end if;
    v_limit := 1500;
  end if;

  v_bucket := to_timestamp(floor(extract(epoch from now()) / 300) * 300);

  insert into private.api_rate_limits(bucket_start, actor_key, route, hits)
  values(v_bucket, v_actor, v_path, 1)
  on conflict(bucket_start, actor_key, route)
  do update set hits = private.api_rate_limits.hits + 1
  returning hits into v_hits;

  if v_hits > v_limit then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object(
        'code','RATE_LIMITED',
        'message','Too many requests. Please try again shortly.'
      )::text,
      detail = jsonb_build_object(
        'status',429,
        'status_text','Too Many Requests'
      )::text;
  end if;

  if random() < 0.01 then
    delete from private.api_rate_limits
    where bucket_start < now() - interval '1 day';
  end if;
end;
$function$;
