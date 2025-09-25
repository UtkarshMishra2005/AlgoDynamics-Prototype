-- 1) Ensure profiles are auto-created for new users via auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Backfill profiles for existing users missing a profile
INSERT INTO public.profiles (user_id, email, role)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'role', 'farmer')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;