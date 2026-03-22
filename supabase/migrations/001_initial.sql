-- Run this in your Supabase SQL Editor

-- Create users table
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create organizations table
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  website text,
  name text,
  metadata jsonb,
  llm_summary jsonb,
  competitors jsonb,
  questions jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_organizations_user_id on public.organizations(user_id);
create index if not exists idx_users_email on public.users(email);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.organizations enable row level security;

-- Policies for users table
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert their own data"
  on public.users for insert
  with check (auth.uid() = id);

-- Policies for organizations table
create policy "Users can view their own organizations"
  on public.organizations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own organizations"
  on public.organizations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own organizations"
  on public.organizations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own organizations"
  on public.organizations for delete
  using (auth.uid() = user_id);

-- Function to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at for users
drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- Trigger to auto-update updated_at for organizations
drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute procedure public.handle_updated_at();

-- Function to handle new user signup (upsert with Google metadata)
-- Google OAuth returns: given_name, family_name, picture
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (
    id,
    email,
    first_name,
    last_name,
    photo_url
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'given_name',
    new.raw_user_meta_data->>'family_name',
    new.raw_user_meta_data->>'picture'
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(excluded.first_name, public.users.first_name),
    last_name = coalesce(excluded.last_name, public.users.last_name),
    photo_url = coalesce(excluded.photo_url, public.users.photo_url),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create/update user record on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
