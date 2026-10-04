create or replace function public.edu_manage_school_member(p_user_id uuid,p_action text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_membership public.edu_school_members%rowtype;
  v_target public.edu_school_members%rowtype;
  v_action text := lower(trim(coalesce(p_action,'')));
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_membership from public.edu_school_members where user_id=v_uid limit 1;
  if v_membership.school_id is null or v_membership.role<>'owner' then raise exception 'OWNER_REQUIRED'; end if;
  select * into v_target from public.edu_school_members
  where school_id=v_membership.school_id and user_id=p_user_id for update;
  if v_target.user_id is null then raise exception 'MEMBER_NOT_FOUND'; end if;
  if v_target.user_id=v_uid then raise exception 'OWNER_SELF_ACTION_DENIED'; end if;

  if v_action='remove' then
    delete from public.edu_school_members where school_id=v_membership.school_id and user_id=v_target.user_id;
  elsif v_action='promote' then
    update public.edu_school_members set role='admin' where school_id=v_membership.school_id and user_id=v_target.user_id;
  elsif v_action='demote' then
    update public.edu_school_members set role='teacher' where school_id=v_membership.school_id and user_id=v_target.user_id;
  elsif v_action='transfer' then
    update public.edu_school_members set role='admin' where school_id=v_membership.school_id and user_id=v_uid;
    update public.edu_school_members set role='owner' where school_id=v_membership.school_id and user_id=v_target.user_id;
    update public.edu_schools set owner_id=v_target.user_id,updated_at=now() where id=v_membership.school_id and owner_id=v_uid;
  else
    raise exception 'INVALID_MEMBER_ACTION';
  end if;
  return true;
end;
$$;

revoke all on function public.edu_manage_school_member(uuid,text) from public;
revoke execute on function public.edu_manage_school_member(uuid,text) from anon;
grant execute on function public.edu_manage_school_member(uuid,text) to authenticated;
