import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PostFlow = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("is_premium")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setIsPremium(data?.is_premium ?? false));
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-5xl block"
        >
          💛
        </motion.span>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">Tu viens de faire quelque chose pour toi.</h1>
          <p className="text-sm text-muted-foreground">
            Imagine si tu pouvais te sentir comme ça plus souvent.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-5 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold">Retour à mon espace</p>
              <p className="mt-1 text-sm text-muted-foreground">Ton rituel t'attend</p>
            </div>
          </Link>

          {!isPremium && (
            <Link
              to="/paywall"
              className="block w-full rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-5 text-center text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <p className="font-bold">Aller plus loin</p>
              <p className="mt-1 text-sm opacity-80">Être accompagnée chaque jour</p>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PostFlow;
