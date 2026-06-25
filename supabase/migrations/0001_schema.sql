create extension if not exists "pgcrypto";

do $$ begin
  create type public.app_role as enum ('mother', 'clinic_staff', 'community_health_worker', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.risk_level as enum ('Low', 'Mid', 'High');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_type as enum ('maternal_risk', 'ppd', 'gdm', 'symptom', 'missed_checkin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.app_role not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  contact text,
  created_at timestamptz not null default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  role text not null default 'clinic_staff',
  created_at timestamptz not null default now(),
  unique (user_id, clinic_id)
);

create table if not exists public.mothers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  age integer not null check (age between 10 and 60),
  gestational_age integer check (gestational_age between 0 and 45),
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.mothers(id) on delete cascade,
  bp_systolic numeric not null check (bp_systolic >= 0),
  bp_diastolic numeric not null check (bp_diastolic >= 0),
  blood_sugar numeric not null check (blood_sugar >= 0),
  body_temp numeric not null check (body_temp >= 0),
  heart_rate numeric not null check (heart_rate >= 0),
  symptoms text[] not null default '{}',
  notes text,
  risk_score integer check (risk_score between 0 and 100),
  risk_level public.risk_level,
  created_at timestamptz not null default now()
);

create table if not exists public.epds_responses (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.mothers(id) on delete cascade,
  responses jsonb not null,
  total_score integer not null check (total_score between 0 and 30),
  ppd_flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.mothers(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  alert_type public.alert_type not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists mothers_user_id_idx on public.mothers(user_id);
create index if not exists mothers_clinic_id_idx on public.mothers(clinic_id);
create index if not exists staff_user_id_idx on public.staff(user_id);
create index if not exists checkins_mother_id_created_at_idx on public.checkins(mother_id, created_at desc);
create index if not exists epds_mother_id_created_at_idx on public.epds_responses(mother_id, created_at desc);
create index if not exists alerts_clinic_id_created_at_idx on public.alerts(clinic_id, created_at desc);

alter table public.users enable row level security;
alter table public.clinics enable row level security;
alter table public.staff enable row level security;
alter table public.mothers enable row level security;
alter table public.checkins enable row level security;
alter table public.epds_responses enable row level security;
alter table public.alerts enable row level security;

create policy "users can read own profile"
  on public.users for select
  using (id = auth.uid());

create policy "users can update own profile"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "clinic staff can read clinic"
  on public.clinics for select
  using (
    exists (
      select 1 from public.staff
      where staff.user_id = auth.uid()
        and staff.clinic_id = clinics.id
    )
  );

create policy "staff can read own staff row"
  on public.staff for select
  using (user_id = auth.uid());

create policy "mothers can read own record"
  on public.mothers for select
  using (user_id = auth.uid());

create policy "clinic staff can read assigned mothers"
  on public.mothers for select
  using (
    exists (
      select 1 from public.staff
      where staff.user_id = auth.uid()
        and staff.clinic_id = mothers.clinic_id
    )
  );

create policy "mothers can update own record"
  on public.mothers for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "mothers can insert own checkins"
  on public.checkins for insert
  with check (
    exists (
      select 1 from public.mothers
      where mothers.id = checkins.mother_id
        and mothers.user_id = auth.uid()
    )
  );

create policy "mothers can read own checkins"
  on public.checkins for select
  using (
    exists (
      select 1 from public.mothers
      where mothers.id = checkins.mother_id
        and mothers.user_id = auth.uid()
    )
  );

create policy "clinic staff can read assigned checkins"
  on public.checkins for select
  using (
    exists (
      select 1
      from public.mothers
      join public.staff on staff.clinic_id = mothers.clinic_id
      where mothers.id = checkins.mother_id
        and staff.user_id = auth.uid()
    )
  );

create policy "mothers can insert own epds"
  on public.epds_responses for insert
  with check (
    exists (
      select 1 from public.mothers
      where mothers.id = epds_responses.mother_id
        and mothers.user_id = auth.uid()
    )
  );

create policy "mothers can read own epds"
  on public.epds_responses for select
  using (
    exists (
      select 1 from public.mothers
      where mothers.id = epds_responses.mother_id
        and mothers.user_id = auth.uid()
    )
  );

create policy "clinic staff can read assigned epds"
  on public.epds_responses for select
  using (
    exists (
      select 1
      from public.mothers
      join public.staff on staff.clinic_id = mothers.clinic_id
      where mothers.id = epds_responses.mother_id
        and staff.user_id = auth.uid()
    )
  );

create policy "clinic staff can read clinic alerts"
  on public.alerts for select
  using (
    exists (
      select 1 from public.staff
      where staff.user_id = auth.uid()
        and staff.clinic_id = alerts.clinic_id
    )
  );

create policy "clinic staff can mark clinic alerts read"
  on public.alerts for update
  using (
    exists (
      select 1 from public.staff
      where staff.user_id = auth.uid()
        and staff.clinic_id = alerts.clinic_id
    )
  )
  with check (
    exists (
      select 1 from public.staff
      where staff.user_id = auth.uid()
        and staff.clinic_id = alerts.clinic_id
    )
  );

