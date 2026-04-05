
-- Create a security definer function to get current is_premium value (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.get_is_premium(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_premium FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Drop and recreate the UPDATE policy using the security definer function
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_premium = public.get_is_premium(auth.uid())
);
