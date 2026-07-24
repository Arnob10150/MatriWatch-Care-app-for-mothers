alter table public.users
  add column if not exists name text,
  add column if not exists password_hash text;

alter table public.mothers
  alter column user_id drop not null,
  alter column clinic_id drop not null;

alter table public.staff
  alter column user_id drop not null,
  alter column clinic_id drop not null;
