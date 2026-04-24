import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Restricts access to subscription-only features.
 * Lifetime (29€) users are redirected to /paywall to upgrade.
 */
const SubscriptionRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [planType, setPlanType] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    const checkPlan = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plan_type")
        .eq("user_id", user.id)
        .single();

      setPlanType((data as any)?.plan_type ?? "none");
      setChecking(false);
    };

    checkPlan();
  }, [user]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (planType !== "subscription") {
    // Lifetime or none users → redirect to paywall to upgrade
    return <Navigate to="/paywall?upgrade=subscription" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionRoute;
