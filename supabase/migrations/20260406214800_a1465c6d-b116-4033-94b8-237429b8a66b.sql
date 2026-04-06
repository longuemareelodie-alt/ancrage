
-- Drop the existing insecure UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new UPDATE policy that prevents users from changing is_premium
-- The WITH CHECK ensures is_premium cannot be changed by the user
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_premium = (SELECT p.is_premium FROM public.profiles p WHERE p.user_id = auth.uid())
);
