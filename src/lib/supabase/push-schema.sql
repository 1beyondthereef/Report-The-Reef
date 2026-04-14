-- Push Subscriptions Table for Web Push Notifications
-- Run this SQL in Supabase Dashboard > SQL Editor

create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subscription jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, subscription)
);

-- Create index for faster lookups by user_id
create index if not exists idx_push_subscriptions_user_id on push_subscriptions(user_id);

-- Enable Row Level Security
alter table push_subscriptions enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can insert own subscriptions" on push_subscriptions;
drop policy if exists "Users can view own subscriptions" on push_subscriptions;
drop policy if exists "Users can delete own subscriptions" on push_subscriptions;

-- Users can manage their own subscriptions
create policy "Users can insert own subscriptions" on push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can view own subscriptions" on push_subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can delete own subscriptions" on push_subscriptions
  for delete using (auth.uid() = user_id);

-- Grant permissions
grant usage on schema public to authenticated;
grant all on push_subscriptions to authenticated;

-- Success message
do $$
begin
  raise notice 'Push subscriptions table created successfully!';
end $$;
