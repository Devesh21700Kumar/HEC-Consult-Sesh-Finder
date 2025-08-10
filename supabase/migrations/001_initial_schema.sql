-- Create profiles table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  level text check (level in ('Beginner', 'Medium', 'Advanced')),
  consulting boolean default false,
  mna boolean default false,
  quant boolean default false,
  created_at timestamp default now()
);

-- Create sessions table
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  time time not null,
  format text check (format in ('Video Call', 'In-person')),
  topic text,
  participant1 uuid references profiles(id) on delete set null,
  participant2 uuid references profiles(id) on delete set null,
  meet_link text,
  created_at timestamp default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table sessions enable row level security;

-- Create policies
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can view sessions they participate in" on sessions
  for select using (auth.uid() = participant1 or auth.uid() = participant2);

create policy "Users can create sessions" on sessions
  for insert with check (auth.uid() = participant1);

create policy "Users can update sessions they participate in" on sessions
  for update using (auth.uid() = participant1 or auth.uid() = participant2);

-- Create indexes for better performance
create index idx_profiles_email on profiles(email);
create index idx_sessions_date on sessions(date);
create index idx_sessions_participants on sessions(participant1, participant2);
