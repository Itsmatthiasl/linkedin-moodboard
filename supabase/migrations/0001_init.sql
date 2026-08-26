create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  linkedin_url text not null,
  author_name text not null,
  author_photo_url text,
  post_text text not null,
  engagement_summary text,
  saved_at timestamptz not null default now()
);

create index if not exists boards_user_id_idx on boards(user_id);
create index if not exists posts_board_id_idx on posts(board_id, saved_at desc);

alter table boards enable row level security;
alter table posts enable row level security;

create policy "Users manage their own boards"
  on boards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage posts on their own boards"
  on posts for all
  using (board_id in (select id from boards where user_id = auth.uid()))
  with check (board_id in (select id from boards where user_id = auth.uid()));
