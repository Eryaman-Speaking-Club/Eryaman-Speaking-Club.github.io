-- Eryaman Speaking Club: public event availability, no personal registration data.
-- Registration closes at the event START, not its end.
-- View exposes aggregate counts only; it never exposes participant details.
create or replace view public.esc_public_upcoming_events
with (security_barrier=true) as
select
 e.id,e.event_code,e.title,e.kind,e.start_at,e.end_at,
 e.venue,e.location_url,e.capacity,e.status,e.registration_enabled,
 e.theme,e.revision,
 coalesce(c.registered_count,0)::integer as registered_count,
 greatest(e.capacity-coalesce(c.registered_count,0),0)::integer as available_seats
from public.esc_events e
left join lateral (
 select count(*)::integer as registered_count
 from public.esc_event_registrations r
 where r.event_id=e.id and r.status='registered'
) c on true
where e.published=true and e.status='planned' and e.start_at>now();

revoke all on public.esc_events from anon;
grant select on public.esc_public_upcoming_events to anon,authenticated;
