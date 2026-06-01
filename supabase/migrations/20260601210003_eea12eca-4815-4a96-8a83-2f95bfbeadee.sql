-- 1) Fix mutable search_path on the 4 pgmq helper functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 2) Revoke broad EXECUTE on all SECURITY DEFINER / sensitive functions,
-- then grant only to the roles that actually need to call them.

-- Trigger / internal-only functions: no API caller needs EXECUTE.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_is_premium() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_mood_response() FROM PUBLIC, anon, authenticated;

-- Email queue helpers: only edge functions (service_role) call these.
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_pending_account_emails() FROM PUBLIC, anon, authenticated;

-- User-facing RPCs: must stay callable by signed-in users; remove anon access.
REVOKE ALL ON FUNCTION public.get_emergency_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_emergency_usage() TO authenticated;

REVOKE ALL ON FUNCTION public.use_emergency() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.use_emergency() TO authenticated;

REVOKE ALL ON FUNCTION public.get_is_premium(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_is_premium(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.regenerate_medical_token() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.regenerate_medical_token() TO authenticated;

REVOKE ALL ON FUNCTION public.upsert_user_progress(integer[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_progress(integer[]) TO authenticated;

REVOKE ALL ON FUNCTION public.award_badges(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_badges(text[]) TO authenticated;

-- Helpers used inside RLS policies: keep callable by signed-in users; remove anon.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.is_community_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_community_member(uuid) TO authenticated;

-- Admin-only RPCs: admin check is enforced inside; revoke anon, keep authenticated.
REVOKE ALL ON FUNCTION public.get_premium_audit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_premium_audit() TO authenticated;

REVOKE ALL ON FUNCTION public.log_audit_anomaly(text, uuid, text, jsonb, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit_anomaly(text, uuid, text, jsonb, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.resolve_webhook_anomaly(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_webhook_anomaly(uuid, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.get_premium_activation_log(text, text, timestamptz, timestamptz, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_premium_activation_log(text, text, timestamptz, timestamptz, integer, integer) TO authenticated;

-- Public-by-design: medical record lookup via opaque token. Keep anon executable.
-- (No change required; ensure grants are explicit.)
GRANT EXECUTE ON FUNCTION public.get_medical_record_by_token(text) TO anon, authenticated;