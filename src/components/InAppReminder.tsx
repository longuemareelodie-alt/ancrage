import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

const InAppReminder = () => {
  const { user } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const { isSupported, isSubscribed, subscribe, loading } = usePushNotifications();

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

      // Show push prompt if supported but not subscribed
      if (isSupported && !isSubscribed) {
        const dismissed = sessionStorage.getItem("push_prompt_dismissed");
        if (!dismissed) setShowPushPrompt(true);
      }
    };
    checkCheckin();
  }, [user, isSupported, isSubscribed]);

  const handleEnablePush = async () => {
    if (!isSupported) {
      toast.error("Les notifications ne sont pas supportées sur ce navigateur. Essaie depuis Chrome ou Safari sur ton téléphone.");
      return;
    }

    // Check notification permission first
    if ("Notification" in window && Notification.permission === "denied") {
      toast.error("Les notifications sont bloquées. Va dans les paramètres de ton navigateur pour les autoriser.");
      return;
    }

    try {
      const ok = await subscribe();
      if (ok) {
        setShowPushPrompt(false);
        toast.success("Rappels activés 💛 Tu recevras un petit message chaque jour.");
      } else {
        toast.error("Impossible d'activer les rappels. Vérifie que les notifications sont autorisées dans ton navigateur.");
      }
    } catch (err) {
      console.error("Push enable error:", err);
      toast.error("Une erreur est survenue lors de l'activation des rappels.");
    }
  };

  const dismissPushPrompt = () => {
    setShowPushPrompt(false);
    sessionStorage.setItem("push_prompt_dismissed", "true");
  };

  return (
    <>
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

      <AnimatePresence>
        {showPushPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-4 rounded-2xl bg-card p-4 shadow-sm border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Reçois un rappel doux chaque jour
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Une notification pour prendre soin de toi
                </p>
                <button
                  onClick={handleEnablePush}
                  disabled={loading}
                  className="mt-2 inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
                >
                  {loading ? "Activation…" : "Activer les rappels"}
                </button>
              </div>
              <button onClick={dismissPushPrompt} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InAppReminder;
