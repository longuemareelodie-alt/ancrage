-- 1. Add the new column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_initiation_access boolean NOT NULL DEFAULT false;

-- 2. Backfill: any existing premium user already has access to the initiation
UPDATE public.profiles
SET has_initiation_access = true
WHERE is_premium = true AND has_initiation_access = false;

-- 3. Extend the protect trigger so only service_role can flip has_initiation_access
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
  IF NEW.has_initiation_access IS DISTINCT FROM OLD.has_initiation_access THEN
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      NEW.has_initiation_access := OLD.has_initiation_access;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;