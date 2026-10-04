drop policy if exists "teachers insert own assignments" on public.edu_assignments;
create policy "teachers insert own assignments"
on public.edu_assignments for insert to authenticated
with check (
  (select auth.uid()) = teacher_id
  and exists (
    select 1 from public.edu_classes c
    where c.id = class_id and c.teacher_id = (select auth.uid())
  )
  and (
    lesson_id is null or exists (
      select 1 from public.edu_lessons l
      where l.id = lesson_id
        and l.teacher_id = (select auth.uid())
        and l.class_id = class_id
    )
  )
);

drop policy if exists "teachers update own assignments" on public.edu_assignments;
create policy "teachers update own assignments"
on public.edu_assignments for update to authenticated
using ((select auth.uid()) = teacher_id)
with check (
  (select auth.uid()) = teacher_id
  and exists (
    select 1 from public.edu_classes c
    where c.id = class_id and c.teacher_id = (select auth.uid())
  )
  and (
    lesson_id is null or exists (
      select 1 from public.edu_lessons l
      where l.id = lesson_id
        and l.teacher_id = (select auth.uid())
        and l.class_id = class_id
    )
  )
);

drop policy if exists "teachers insert own schedule" on public.edu_schedule_events;
create policy "teachers insert own schedule"
on public.edu_schedule_events for insert to authenticated
with check (
  (select auth.uid()) = teacher_id
  and (class_id is null or exists (
    select 1 from public.edu_classes c
    where c.id = class_id and c.teacher_id = (select auth.uid())
  ))
  and (private_student_id is null or exists (
    select 1 from public.edu_private_students s
    where s.id = private_student_id and s.teacher_id = (select auth.uid())
  ))
  and (lesson_id is null or exists (
    select 1 from public.edu_lessons l
    where l.id = lesson_id and l.teacher_id = (select auth.uid())
  ))
);

drop policy if exists "teachers update own schedule" on public.edu_schedule_events;
create policy "teachers update own schedule"
on public.edu_schedule_events for update to authenticated
using ((select auth.uid()) = teacher_id)
with check (
  (select auth.uid()) = teacher_id
  and (class_id is null or exists (
    select 1 from public.edu_classes c
    where c.id = class_id and c.teacher_id = (select auth.uid())
  ))
  and (private_student_id is null or exists (
    select 1 from public.edu_private_students s
    where s.id = private_student_id and s.teacher_id = (select auth.uid())
  ))
  and (lesson_id is null or exists (
    select 1 from public.edu_lessons l
    where l.id = lesson_id and l.teacher_id = (select auth.uid())
  ))
);
