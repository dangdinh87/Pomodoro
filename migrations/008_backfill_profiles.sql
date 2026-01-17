
-- Backfill profiles for existing users
INSERT INTO public.profiles (id, name, avatar_url)
SELECT 
  id, 
  COALESCE(
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'name', 
    raw_user_meta_data->>'preferred_username',
    raw_user_meta_data->>'user_name',
    split_part(email, '@', 1)
  ) as name,
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
