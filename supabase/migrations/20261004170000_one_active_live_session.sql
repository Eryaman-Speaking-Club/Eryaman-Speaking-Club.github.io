create unique index if not exists edu_live_sessions_one_active_per_class_idx
on public.edu_live_sessions (class_id)
where status in ('waiting','active','paused');
