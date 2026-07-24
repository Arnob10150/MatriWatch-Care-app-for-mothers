-- Existing mother/staff accounts were created before clinic selection existed
-- in the registration form, leaving clinic_id null. Alerts require a
-- clinic_id to attach to, so these orphaned rows silently produced zero
-- clinic-visible alerts. Backfill them onto the single existing clinic.
do $$
declare
  default_clinic_id uuid;
begin
  select id into default_clinic_id from public.clinics order by created_at asc limit 1;

  if default_clinic_id is not null then
    update public.mothers set clinic_id = default_clinic_id where clinic_id is null;
    update public.staff set clinic_id = default_clinic_id where clinic_id is null;
  end if;
end $$;
