
-- Trigger function to prevent is_premium changes from non-service-role sessions
CREATE OR REPLACE FUNCTION public.protect_is_premium()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    -- Only allow changes from service_role (backend)
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      NEW.is_premium := OLD.is_premium;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_is_premium_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_is_premium();

-- Simplify the UPDATE policy now that the trigger handles protection
DROP POLICY IF EXISTS "Users can update own profile except is_premium" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
