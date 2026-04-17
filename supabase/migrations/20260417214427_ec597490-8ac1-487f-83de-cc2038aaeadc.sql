-- Add plan_type column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'none';

-- Backfill existing premium users as 'subscription' (safe default — don't downgrade)
UPDATE public.profiles
SET plan_type = 'subscription'
WHERE is_premium = true AND plan_type = 'none';

-- Add check constraint for valid values
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_plan_type_check;
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_plan_type_check
CHECK (plan_type IN ('none', 'lifetime', 'subscription'));

-- Update protect_is_premium trigger to also protect plan_type
CREATE OR REPLACE FUNCTION public.protect_is_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      NEW.is_premium := OLD.is_premium;
    END IF;
  END IF;
  IF NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      NEW.plan_type := OLD.plan_type;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Make sure trigger exists on profiles
DROP TRIGGER IF EXISTS protect_premium_trigger ON public.profiles;
CREATE TRIGGER protect_premium_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_is_premium();