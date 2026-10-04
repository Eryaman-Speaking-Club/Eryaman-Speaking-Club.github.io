create or replace function public.edu_grade_assignment_result(
  p_result_id uuid,
  p_score numeric,
  p_feedback text
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_result public.edu_student_results%rowtype;
  v_clean_feedback text;
  v_score numeric;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into v_result
  from public.edu_student_results
  where id=p_result_id and activity_type='assignment'
  for update;

  if v_result.id is null then raise exception 'RESULT_NOT_FOUND'; end if;

  if not exists(
    select 1 from public.edu_classes c
    where c.id=v_result.class_id and c.teacher_id=v_uid
  ) then raise exception 'RESULT_ACCESS_DENIED'; end if;

  v_clean_feedback:=left(trim(coalesce(p_feedback,'')),1200);
  v_score:=case when p_score is null then null else greatest(0,least(100,p_score)) end;

  update public.edu_student_results
  set score=v_score,
      payload=jsonb_set(coalesce(payload,'{}'::jsonb),'{teacher_feedback}',to_jsonb(v_clean_feedback),true)
  where id=v_result.id;

  return true;
end;
$$;

revoke all on function public.edu_grade_assignment_result(uuid,numeric,text) from public;
revoke execute on function public.edu_grade_assignment_result(uuid,numeric,text) from anon;
grant execute on function public.edu_grade_assignment_result(uuid,numeric,text) to authenticated;

create or replace function public.edu_student_state(p_join_token text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
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

  if v_student.id is null then raise exception 'STUDENT_SESSION_NOT_FOUND'; end if;

  select * into v_class from public.edu_classes where id = v_student.class_id;
  if v_class.id is null or not v_class.is_active then raise exception 'CLASS_NOT_AVAILABLE'; end if;

  update public.edu_students
  set last_seen_at = now()
  where id = v_student.id
    and (last_seen_at is null or last_seen_at < now() - interval '30 seconds');

  select * into v_session
  from public.edu_live_sessions
  where class_id = v_class.id and status in ('waiting','active','paused')
  order by started_at desc limit 1;

  if v_session.id is null then
    select * into v_session
    from public.edu_live_sessions
    where class_id = v_class.id
      and status = 'completed'
      and coalesce(ended_at,updated_at,started_at) >= now() - interval '2 hours'
    order by coalesce(ended_at,updated_at,started_at) desc limit 1;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'title',q.title,'instructions',q.instructions,'due_at',q.due_at,
    'completed',q.completed,'overdue',q.overdue,'score',q.score,'teacher_feedback',q.teacher_feedback
  ) order by q.due_at nulls last,q.created_at desc),'[]'::jsonb)
  into v_assignments
  from (
    select a.id,a.title,a.instructions,a.due_at,a.created_at,
      (r.id is not null) completed,
      (a.due_at is not null and a.due_at < now()) overdue,
      r.score,
      nullif(r.payload->>'teacher_feedback','') teacher_feedback
    from public.edu_assignments a
    left join lateral (
      select rr.id,rr.score,rr.payload
      from public.edu_student_results rr
      where rr.student_id=v_student.id
        and rr.activity_type='assignment'
        and rr.payload->>'assignment_id'=a.id::text
      order by rr.created_at desc
      limit 1
    ) r on true
    where a.class_id=v_class.id and a.status='published'
    order by a.due_at nulls last,a.created_at desc
    limit 20
  ) q;

  return jsonb_build_object(
    'student',jsonb_build_object('id',v_student.id,'display_name',v_student.display_name),
    'class',jsonb_build_object(
      'id',v_class.id,'name',v_class.name,'age_group',v_class.age_group,
      'level',v_class.level,'focus',v_class.focus,'join_code',v_class.join_code
    ),
    'session',case when v_session.id is null then null else jsonb_build_object(
      'id',v_session.id,'status',v_session.status,'current_index',v_session.current_index,
      'current_stage',v_session.current_stage,'current_payload',v_session.current_payload,
      'scores',v_session.scores,'updated_at',v_session.updated_at
    ) end,
    'assignments',v_assignments
  );
end;
$$;
