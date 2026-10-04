alter table public.edu_students
add column if not exists teacher_note text;

do $$
begin
  if not exists(select 1 from pg_constraint where conname='edu_students_teacher_note_check') then
    alter table public.edu_students
      add constraint edu_students_teacher_note_check
      check (teacher_note is null or char_length(teacher_note) <= 1500);
  end if;
end $$;
