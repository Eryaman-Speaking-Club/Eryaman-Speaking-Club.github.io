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

  update public.edu_students
  set last_seen_at = now()
  where id = v_student.id
    and (last_seen_at is null or last_seen_at < now() - interval '30 seconds');

  select * into v_session
  from public.edu_live_sessions
  where class_id = v_class.id
    and status in ('waiting','active','paused')
  order by started_at desc
  limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', q.id,
    'title', q.title,
    'instructions', q.instructions,
    'due_at', q.due_at,
    'completed', q.completed
  ) order by q.due_at nulls last, q.created_at desc), '[]'::jsonb)
  into v_assignments
  from (
    select a.id,a.title,a.instructions,a.due_at,a.created_at,
      exists(
        select 1 from public.edu_student_results r
        where r.student_id=v_student.id
          and r.activity_type='assignment'
          and r.payload->>'assignment_id'=a.id::text
      ) as completed
    from public.edu_assignments a
    where a.class_id=v_class.id and a.status='published'
    order by a.due_at nulls last, a.created_at desc
    limit 20
  ) q;

  return jsonb_build_object(
    'student', jsonb_build_object('id',v_student.id,'display_name',v_student.display_name),
    'class', jsonb_build_object(
      'id',v_class.id,'name',v_class.name,'age_group',v_class.age_group,
      'level',v_class.level,'focus',v_class.focus,'join_code',v_class.join_code
    ),
    'session', case when v_session.id is null then null else jsonb_build_object(
      'id',v_session.id,'status',v_session.status,'current_index',v_session.current_index,
      'current_stage',v_session.current_stage,'current_payload',v_session.current_payload,
      'scores',v_session.scores,'updated_at',v_session.updated_at
    ) end,
    'assignments', v_assignments
  );
end;
$function$;
