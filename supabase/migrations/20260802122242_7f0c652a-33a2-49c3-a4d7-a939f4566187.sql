REVOKE EXECUTE ON FUNCTION public.get_community_authors(uuid[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_community_authors(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_community_authors(uuid[]) TO authenticated;