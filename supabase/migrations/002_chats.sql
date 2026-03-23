-- Create chats table
create table if not exists public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_chats_user_id on public.chats(user_id);
create index if not exists idx_chats_updated_at on public.chats(updated_at desc);
create index if not exists idx_chat_messages_chat_id on public.chat_messages(chat_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at);

-- Enable Row Level Security
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;

-- Policies for chats table
create policy "Users can view their own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chats"
  on public.chats for update
  using (auth.uid() = user_id);

create policy "Users can delete their own chats"
  on public.chats for delete
  using (auth.uid() = user_id);

-- Policies for chat_messages table
create policy "Users can view messages in their own chats"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = chat_messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their own chats"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chats
      where chats.id = chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can delete messages in their own chats"
  on public.chat_messages for delete
  using (
    exists (
      select 1 from public.chats
      where chats.id = chat_messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Trigger to auto-update updated_at for chats
drop trigger if exists set_chats_updated_at on public.chats;
create trigger set_chats_updated_at
  before update on public.chats
  for each row execute procedure public.handle_updated_at();
