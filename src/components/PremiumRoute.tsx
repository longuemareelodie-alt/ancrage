import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PremiumRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    const checkPremium = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .single();

      setIsPremium(data?.is_premium ?? false);
      setChecking(false);
    };

    checkPremium();
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

  if (!isPremium) {
    return <Navigate to="/aller-plus-loin" replace />;
  }

  return <>{children}</>;
};

export default PremiumRoute;
