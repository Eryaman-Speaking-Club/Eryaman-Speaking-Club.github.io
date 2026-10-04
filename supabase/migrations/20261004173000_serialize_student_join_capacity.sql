create or replace function public.edu_join_class(p_join_code text, p_display_name text, p_join_token text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_class public.edu_classes%rowtype;
  v_student public.edu_students%rowtype;
  v_count integer;
  v_hash text;
  v_session public.edu_live_sessions%rowtype;
begin
  if p_join_code is null or char_length(trim(p_join_code)) < 4 or char_length(trim(p_join_code)) > 8 then
    raise exception 'INVALID_CLASS_CODE';
  end if;
  if p_display_name is null or char_length(trim(p_display_name)) < 1 or char_length(trim(p_display_name)) > 40 then
    raise exception 'INVALID_NAME';
  end if;
  if p_join_token is null or char_length(p_join_token) < 24 or char_length(p_join_token) > 200 then
    raise exception 'INVALID_JOIN_TOKEN';
  end if;

  select * into v_class
  from public.edu_classes
  where join_code = upper(trim(p_join_code)) and is_active = true
  limit 1 for update;

  if v_class.id is null then raise exception 'CLASS_NOT_FOUND'; end if;

  v_hash := encode(extensions.digest(p_join_token, 'sha256'), 'hex');
  select * into v_student from public.edu_students where join_token_hash = v_hash limit 1;

  if v_student.id is not null then
    if v_student.class_id <> v_class.id then raise exception 'TOKEN_CLASS_MISMATCH'; end if;
    if not v_student.is_active then
      select count(*) into v_count from public.edu_students
      where class_id = v_class.id and is_active = true;
      if v_count >= v_class.max_students then raise exception 'CLASS_FULL'; end if;
    end if;
    update public.edu_students
      set display_name=trim(p_display_name),last_seen_at=now(),is_active=true
      where id=v_student.id returning * into v_student;
  else
    select count(*) into v_count from public.edu_students
    where class_id=v_class.id and is_active=true;
    if v_count >= v_class.max_students then raise exception 'CLASS_FULL'; end if;
    insert into public.edu_students(class_id,display_name,join_token_hash)
    values(v_class.id,trim(p_display_name),v_hash)
    returning * into v_student;
  end if;

  select * into v_session
  from public.edu_live_sessions
  where class_id=v_class.id and status in ('waiting','active','paused')
  order by started_at desc limit 1;

  return jsonb_build_object(
    'student_id',v_student.id,
    'class',jsonb_build_object(
      'id',v_class.id,'name',v_class.name,'age_group',v_class.age_group,
      'level',v_class.level,'focus',v_class.focus,'join_code',v_class.join_code
    ),
    'session',case when v_session.id is null then null else jsonb_build_object(
      'id',v_session.id,'status',v_session.status,'current_index',v_session.current_index,
      'current_stage',v_session.current_stage,'current_payload',v_session.current_payload,
      'scores',v_session.scores,'updated_at',v_session.updated_at
    ) end
  );
end;
$function$;
