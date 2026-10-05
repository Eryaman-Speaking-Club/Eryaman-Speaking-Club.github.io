CREATE OR REPLACE FUNCTION public.edu_student_state(p_join_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_hash text;
  v_student public.edu_students%rowtype;
  v_class public.edu_classes%rowtype;
  v_session public.edu_live_sessions%rowtype;
  v_lesson public.edu_lessons%rowtype;
  v_teacher_name text;
  v_assignments jsonb;
  v_recent jsonb;
  v_recent_lessons jsonb;
  v_upcoming jsonb;
  v_participated integer := 0;
  v_need_help integer := 0;
  v_assignment_total integer := 0;
  v_assignment_completed integer := 0;
  v_assignment_overdue integer := 0;
  v_assignment_feedback integer := 0;
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

  select p.display_name into v_teacher_name
  from public.educator_profiles p
  where p.user_id=v_class.teacher_id
  limit 1;

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

  if v_session.lesson_id is not null then
    select * into v_lesson
    from public.edu_lessons
    where id=v_session.lesson_id and class_id=v_class.id
    limit 1;
  end if;

  if v_session.id is not null then
    select
      count(*) filter (where activity_type='participated'),
      count(*) filter (where activity_type='need-help')
    into v_participated, v_need_help
    from public.edu_student_results
    where student_id=v_student.id and session_id=v_session.id;

    select coalesce(jsonb_agg(x order by x.created_at desc),'[]'::jsonb)
    into v_recent
    from (
      select jsonb_build_object(
        'activity_type',r.activity_type,
        'score',r.score,
        'stage',coalesce(r.payload->>'stage',''),
        'created_at',r.created_at
      ) as x, r.created_at
      from public.edu_student_results r
      where r.student_id=v_student.id
        and r.session_id=v_session.id
        and r.activity_type in ('participated','need-help')
      order by r.created_at desc
      limit 8
    ) q;
  else
    v_recent := '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',q.id,'title',q.title,'instructions',q.instructions,'due_at',q.due_at,
    'completed',q.completed,'overdue',q.overdue,'score',q.score,'teacher_feedback',q.teacher_feedback
  ) order by q.due_at nulls last,q.created_at desc),'[]'::jsonb)
  into v_assignments
  from (
    select a.id,a.title,a.instructions,a.due_at,a.created_at,
      (r.id is not null) completed,
      (a.due_at is not null and a.due_at < now() and r.id is null) overdue,
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

  select
    count(*),
    count(*) filter (where completed),
    count(*) filter (where overdue),
    count(*) filter (where teacher_feedback is not null or score is not null)
  into v_assignment_total,v_assignment_completed,v_assignment_overdue,v_assignment_feedback
  from jsonb_to_recordset(coalesce(v_assignments,'[]'::jsonb))
    as x(id uuid,title text,instructions text,due_at timestamptz,completed boolean,overdue boolean,score numeric,teacher_feedback text);

  select coalesce(jsonb_agg(x order by x.ended_at desc),'[]'::jsonb)
  into v_recent_lessons
  from (
    select
      s.id as session_id,
      s.lesson_id,
      coalesce(l.title,l.topic,'English lesson') as title,
      coalesce(l.topic,'English') as topic,
      coalesce(l.duration_minutes,40) as duration_minutes,
      coalesce(l.primary_goal,'speaking') as primary_goal,
      s.started_at,
      coalesce(s.ended_at,s.updated_at,s.started_at) as ended_at,
      (select count(*) from public.edu_student_results r
        where r.student_id=v_student.id and r.session_id=s.id and r.activity_type='participated') as participated_count,
      (select count(*) from public.edu_student_results r
        where r.student_id=v_student.id and r.session_id=s.id and r.activity_type='need-help') as need_help_count
    from public.edu_live_sessions s
    left join public.edu_lessons l on l.id=s.lesson_id
    where s.class_id=v_class.id
      and s.status='completed'
      and s.started_at >= v_student.joined_at - interval '5 minutes'
    order by coalesce(s.ended_at,s.updated_at,s.started_at) desc
    limit 8
  ) x;

  select case when e.id is null then null else jsonb_build_object(
    'id',e.id,
    'title',e.title,
    'starts_at',e.starts_at,
    'duration_minutes',e.duration_minutes,
    'notes',e.notes
  ) end
  into v_upcoming
  from public.edu_schedule_events e
  where e.class_id=v_class.id
    and e.status='scheduled'
    and e.starts_at >= now()
  order by e.starts_at asc
  limit 1;

  return jsonb_build_object(
    'student',jsonb_build_object(
      'id',v_student.id,
      'display_name',v_student.display_name,
      'joined_at',v_student.joined_at,
      'last_seen_at',v_student.last_seen_at
    ),
    'teacher',jsonb_build_object(
      'display_name',coalesce(v_teacher_name,'Teacher')
    ),
    'class',jsonb_build_object(
      'id',v_class.id,'name',v_class.name,'age_group',v_class.age_group,
      'level',v_class.level,'focus',v_class.focus,'join_code',v_class.join_code
    ),
    'session',case when v_session.id is null then null else jsonb_build_object(
      'id',v_session.id,'status',v_session.status,'current_index',v_session.current_index,
      'current_stage',v_session.current_stage,'current_payload',v_session.current_payload,
      'scores',v_session.scores,'updated_at',v_session.updated_at
    ) end,
    'lesson',case when v_lesson.id is null then null else jsonb_build_object(
      'id',v_lesson.id,
      'title',v_lesson.title,
      'topic',v_lesson.topic,
      'duration_minutes',v_lesson.duration_minutes,
      'primary_goal',v_lesson.primary_goal,
      'plan',v_lesson.plan,
      'status',v_lesson.status
    ) end,
    'student_progress',jsonb_build_object(
      'participated_count',v_participated,
      'need_help_count',v_need_help,
      'recent_activity',coalesce(v_recent,'[]'::jsonb)
    ),
    'assignment_summary',jsonb_build_object(
      'total',v_assignment_total,
      'completed',v_assignment_completed,
      'overdue',v_assignment_overdue,
      'feedback_count',v_assignment_feedback,
      'todo',greatest(v_assignment_total-v_assignment_completed-v_assignment_overdue,0)
    ),
    'upcoming_class',v_upcoming,
    'recent_lessons',coalesce(v_recent_lessons,'[]'::jsonb),
    'assignments',v_assignments
  );
end;
$function$


revoke execute on function public.edu_student_state(text) from public, authenticated;
grant execute on function public.edu_student_state(text) to anon;
