revoke execute on function public.edu_join_class(text,text,text) from public, authenticated;
revoke execute on function public.edu_student_state(text) from public, authenticated;
revoke execute on function public.edu_submit_result(text,uuid,text,numeric,jsonb) from public, authenticated;

grant execute on function public.edu_join_class(text,text,text) to anon;
grant execute on function public.edu_student_state(text) to anon;
grant execute on function public.edu_submit_result(text,uuid,text,numeric,jsonb) to anon;
