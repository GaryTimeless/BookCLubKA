create table public.feedback (
  id uuid not null default gen_random_uuid (),
  user_id uuid null default auth.uid (),
  content text not null,
  created_at timestamp with time zone not null default now(),
  constraint feedback_pkey primary key (id),
  constraint feedback_user_id_fkey foreign key (user_id) references auth.users (id) on delete set null
) tablespace pg_default;
