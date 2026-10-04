alter table public.edu_classes
  alter column join_code
  set default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
