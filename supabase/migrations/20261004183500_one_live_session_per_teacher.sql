with ranked as (
  select id,teacher_id,
         row_number() over (
           partition by teacher_id
           order by started_at desc nulls last, updated_at desc
         ) as rn
  from public.edu_live_sessions
  where status in ('waiting','active','paused')
),
closed as (
  update public.edu_live_sessions s
  set status='completed',
      ended_at=coalesce(s.ended_at,now()),
      updated_at=now()
  from ranked r
  where s.id=r.id and r.rn>1
  returning s.lesson_id,s.teacher_id
)
update public.edu_lessons l
set status='completed',updated_at=now()
from closed c
where c.lesson_id=l.id and c.teacher_id=l.teacher_id;

create unique index if not exists edu_live_sessions_one_active_per_teacher_idx
  on public.edu_live_sessions (teacher_id)
  where status in ('waiting','active','paused');
