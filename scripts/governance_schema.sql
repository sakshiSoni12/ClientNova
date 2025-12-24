-- Enable RLS
alter table public.profiles enable row level security;

-- Create User Role Enum
do $$ begin
    create type user_role as enum ('admin', 'team_member', 'viewer');
exception
    when duplicate_object then null;
end $$;

-- Add role column to profiles if it doesn't exist
alter table public.profiles 
add column if not exists role user_role not null default 'viewer';

-- Create Approval Requests Table
create table if not exists public.approval_requests (
    id uuid default gen_random_uuid() primary key,
    request_type text not null, -- 'DELETE_CLIENT', 'DELETE_PROJECT'
    entity_id uuid not null,
    requested_by uuid references auth.users(id) not null,
    status text not null default 'pending', -- 'pending', 'approved', 'rejected'
    created_at timestamptz default now()
);

-- RLS Policies for Profiles
create policy "Public profiles are viewable by everyone"
on public.profiles for select
using ( true );

create policy "Users can insert their own profile"
on public.profiles for insert
with check ( auth.uid() = id );

create policy "Users can update own profile"
on public.profiles for update
using ( auth.uid() = id );

-- RLS Policies for Approval Requests
alter table public.approval_requests enable row level security;

create policy "Admins can view all requests"
on public.approval_requests for select
using ( 
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

create policy "Users can view their own requests"
on public.approval_requests for select
using ( auth.uid() = requested_by );

create policy "Team Members can create requests"
on public.approval_requests for insert
with check ( 
  auth.uid() = requested_by 
);

create policy "Admins can update requests"
on public.approval_requests for update
using ( 
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
