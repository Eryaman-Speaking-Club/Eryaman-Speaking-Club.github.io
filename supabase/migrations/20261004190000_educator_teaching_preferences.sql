alter table public.educator_profiles
  add column if not exists preferred_language text not null default 'tr',
  add column if not exists teaching_context text not null default 'mixed',
  add column if not exists default_age_group text not null default '12-14',
  add column if not exists default_level text not null default 'A2',
  add column if not exists default_duration smallint not null default 40,
  add column if not exists country_code text,
  add column if not exists institution_name text,
  add column if not exists onboarding_completed boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname='educator_profiles_preferred_language_check') then
    alter table public.educator_profiles add constraint educator_profiles_preferred_language_check check (preferred_language in ('tr','en'));
  end if;
  if not exists (select 1 from pg_constraint where conname='educator_profiles_teaching_context_check') then
    alter table public.educator_profiles add constraint educator_profiles_teaching_context_check check (teaching_context in ('school','private','mixed','general'));
  end if;
  if not exists (select 1 from pg_constraint where conname='educator_profiles_default_age_group_check') then
    alter table public.educator_profiles add constraint educator_profiles_default_age_group_check check (default_age_group in ('6-8','9-11','12-14','15-17','18+'));
  end if;
  if not exists (select 1 from pg_constraint where conname='educator_profiles_default_level_check') then
    alter table public.educator_profiles add constraint educator_profiles_default_level_check check (default_level in ('Pre-A1','A1','A2','B1','B2'));
  end if;
  if not exists (select 1 from pg_constraint where conname='educator_profiles_default_duration_check') then
    alter table public.educator_profiles add constraint educator_profiles_default_duration_check check (default_duration between 20 and 120);
  end if;
  if not exists (select 1 from pg_constraint where conname='educator_profiles_country_code_check') then
    alter table public.educator_profiles add constraint educator_profiles_country_code_check check (country_code is null or country_code ~ '^[A-Z]{2}$');
  end if;
end $$;
