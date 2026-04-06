
-- Drop existing INSERT policy (allows setting is_premium=true)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Block client-side INSERT (profile is created by handle_new_user trigger which is SECURITY DEFINER)
CREATE POLICY "No client inserts on profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Drop existing UPDATE policy (allows changing is_premium)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Allow users to update their own profile BUT prevent changing is_premium
CREATE POLICY "Users can update own profile except is_premium"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_premium = (SELECT p.is_premium FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- Block client-side DELETE
CREATE POLICY "No client deletes on profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);
