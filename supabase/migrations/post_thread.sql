create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anime_id integer not null, -- Jikan ID
  title text not null,
  content text,
  lang text default 'en', -- 'id' atau 'en'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================================
-- Tabel posts (komentar balasan)
-- ========================================
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================================
-- Enable RLS
-- ========================================
alter table threads enable row level security;
alter table posts enable row level security;

-- ========================================
-- Policies untuk threads
-- ========================================
create policy "Allow read all threads"
on threads
for select using (true);

create policy "Allow insert for authenticated users"
on threads
for insert with check (auth.uid() = user_id);

create policy "Allow update/delete by thread owner"
on threads
for update using (auth.uid() = user_id),
delete using (auth.uid() = user_id);

-- ========================================
-- Policies untuk posts
-- ========================================
create policy "Allow read all posts"
on posts
for select using (true);

create policy "Allow insert for authenticated users"
on posts
for insert with check (auth.uid() = user_id);

create policy "Allow update/delete by post owner"
on posts
for update using (auth.uid() = user_id),
delete using (auth.uid() = user_id);