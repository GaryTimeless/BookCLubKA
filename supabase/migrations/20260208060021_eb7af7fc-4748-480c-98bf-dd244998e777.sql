
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Add user_id to books (nullable for existing data)
ALTER TABLE public.books ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Drop old permissive INSERT policy, replace with auth-based
DROP POLICY IF EXISTS "Anyone can insert books" ON public.books;

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 3. Add user_id to votes (nullable for existing data)
ALTER TABLE public.votes ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Drop old permissive INSERT policy, replace with auth-based
DROP POLICY IF EXISTS "Anyone can insert votes" ON public.votes;

CREATE POLICY "Authenticated users can insert own votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
