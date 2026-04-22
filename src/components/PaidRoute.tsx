import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Allows access to any paying user (lifetime OR subscription).
 * Redirects free users to /paywall.
 */
const PaidRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [planType, setPlanType] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    supabase.from("profiles").select("plan_type").eq("user_id", user.id).single()
      .then(({ data }) => {
        setPlanType((data as any)?.plan_type ?? "none");
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
  if (planType === "none" || !planType) return <Navigate to="/paywall" replace />;
  return <>{children}</>;
};

export default PaidRoute;
