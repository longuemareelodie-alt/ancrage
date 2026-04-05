
-- Drop the existing overly permissive UPDATE policy
DROP POLICY "Users can update their own profile" ON public.profiles;

-- Create a restricted UPDATE policy that prevents users from changing is_premium
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_premium = (SELECT p.is_premium FROM public.profiles p WHERE p.user_id = auth.uid())
);
