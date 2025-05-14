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
-- THREADS: READ
create policy "Allow read all threads"
on threads
for select using (true);

-- THREADS: INSERT
create policy "Allow insert for authenticated users"
on threads
for insert with check (auth.uid() = user_id);

-- THREADS: UPDATE
create policy "Allow update by thread owner"
on threads
for update using (auth.uid() = user_id);

-- THREADS: DELETE
create policy "Allow delete by thread owner"
on threads
for delete using (auth.uid() = user_id);

-- ========================================
-- Policies untuk posts
-- ========================================
-- Posts: READ
create policy "Allow read all posts"
on posts
for select using (true);

-- Posts: INSERT
create policy "Allow insert for authenticated users"
on posts
for insert with check (auth.uid() = user_id);

-- Posts: UPDATE
create policy "Allow update by post owner"
on posts
for update using (auth.uid() = user_id);

-- Posts: DELETE
create policy "Allow delete by post owner"
on posts
for delete using (auth.uid() = user_id);

-- Add entity_type column
ALTER TABLE bookmarks
ADD COLUMN entity_type text NOT NULL DEFAULT 'anime'
CHECK (entity_type IN ('anime', 'character'));

-- Rename jikan_id to entity_id for clarity
ALTER TABLE bookmarks 
RENAME COLUMN jikan_id TO entity_id;

-- Update unique constraint
ALTER TABLE bookmarks
DROP CONSTRAINT IF EXISTS bookmarks_user_id_jikan_id_key;

ALTER TABLE bookmarks
ADD CONSTRAINT bookmarks_user_id_entity_id_entity_type_key 
UNIQUE (user_id, entity_id, entity_type);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_notification_type CHECK (
    type IN ('reply', 'mention', 'review', 'bookmark', 'content_approved', 'content_rejected')
  )
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX notifications_read_idx ON notifications(read);

-- Add comment
COMMENT ON TABLE notifications IS 'User notifications for various events';