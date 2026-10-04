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

    if exists(
      select 1 from public.edu_student_results r
      where r.student_id=v_student.id
        and r.activity_type='assignment'
        and r.payload->>'assignment_id'=v_assignment_id::text
    ) then return true; end if;
  end if;

  insert into public.edu_student_results(student_id,class_id,session_id,activity_type,score,payload)
  values(v_student.id,v_student.class_id,p_session_id,trim(p_activity_type),p_score,coalesce(p_payload,'{}'::jsonb));
  return true;
end;
$function$;
