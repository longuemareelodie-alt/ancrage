import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Allows access to any paying user (lifetime access after one-time payment).
 * Redirects free users to /paywall.
 */
const PaidRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    supabase
      .from("profiles")
      .select("is_premium")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setIsPaid(!!data?.is_premium);
        setChecking(false);
      });
  }, [user]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isPaid) return <Navigate to="/paywall" replace />;
  return <>{children}</>;
};

export default PaidRoute;
