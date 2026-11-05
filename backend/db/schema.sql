-- Skema awal (rancangan bagian 7). Jalankan di Supabase SQL Editor.
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  language text not null default 'id' check (language in ('id','en')),
  created_at timestamptz default now()
);

create table if not exists destinations (
  id text primary key,
  name text not null,
  regency text not null,
  lat double precision not null,
  lng double precision not null,
  categories text[] not null default '{}',
  family boolean default false,
  accessible boolean default false,
  popularity text check (popularity in ('popular','hidden')),
  hours text,
  desc_id text,
  desc_en text,
  source text,
  verified_at date
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text,
  saved boolean not null default false,
  source text not null default 'rules',
  duration_days int not null check (duration_days between 1 and 21),
  language text not null default 'id',
  start_type text, start_label text, start_lat double precision, start_lng double precision,
  preferences jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips on delete cascade,
  day_number int not null
);

create table if not exists itinerary_items (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references itinerary_days on delete cascade,
  destination_id text not null references destinations,
  position int not null,
  reasons text[] default '{}',
  km numeric
);

-- Row Level Security: pengguna hanya melihat datanya sendiri
alter table profiles enable row level security;
alter table trips enable row level security;
alter table itinerary_days enable row level security;
alter table itinerary_items enable row level security;
alter table destinations enable row level security;

create policy "profil sendiri" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "trip sendiri" on trips for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "hari milik trip sendiri" on itinerary_days for all
  using (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()))
  with check (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()));
create policy "item milik trip sendiri" on itinerary_items for all
  using (exists (select 1 from itinerary_days d join trips t on t.id = d.trip_id where d.id = day_id and t.user_id = auth.uid()))
  with check (exists (select 1 from itinerary_days d join trips t on t.id = d.trip_id where d.id = day_id and t.user_id = auth.uid()));
create policy "destinasi bisa dibaca" on destinations for select using (true);
