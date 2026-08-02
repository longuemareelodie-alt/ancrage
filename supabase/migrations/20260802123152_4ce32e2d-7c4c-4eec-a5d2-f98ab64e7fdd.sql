REVOKE EXECUTE ON FUNCTION public.has_family_read_access(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_family_read_access(uuid, uuid) TO authenticated, service_role;