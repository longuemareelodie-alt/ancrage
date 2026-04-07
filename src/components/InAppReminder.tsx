import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

const InAppReminder = () => {
  const { user } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();

  // Auto-subscribe to push notifications on mount
  useEffect(() => {
    if (!user || !isSupported || isSubscribed) return;

    const autoSubscribe = async () => {
      // Small delay so the page loads first
      await new Promise((r) => setTimeout(r, 2000));

      try {
        const ok = await subscribe();
        if (ok) {
          toast.success("Rappels activés 💛");
        }
      } catch {
        // Silent fail — user denied or browser doesn't support
      }
    };

    autoSubscribe();
  }, [user, isSupported, isSubscribed, subscribe]);

  // Check if user did today's checkin
  useEffect(() => {
    if (!user) return;
    const checkCheckin = async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("profiles")
        .select("last_checkin_date")
        .eq("user_id", user.id)
        .single();

      if (!data?.last_checkin_date || data.last_checkin_date !== today) {
        setShowReminder(true);
      }
    };
    checkCheckin();
  }, [user]);

  return (
    <AnimatePresence>
      {showReminder && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-4 mb-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/30 p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Tu n'as pas encore fait ton check-in 💛
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Prends 30 secondes pour toi
              </p>
              <Link
                to="/checkin"
                className="mt-2 inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm"
              >
                Faire mon check-in
              </Link>
            </div>
            <button onClick={() => setShowReminder(false)} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InAppReminder;
