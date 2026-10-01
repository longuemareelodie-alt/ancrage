import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { bannerDismissKey, useActiveSpaces } from "@/lib/spaces";

/** Comptes existants : on propose, on n'impose jamais. « Plus tard » est retenu. */
const PersonalizeBanner = () => {
  const { user } = useAuth();
  const { personalized, uid } = useActiveSpaces();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!user) return;
    try {
      setDismissed(localStorage.getItem(bannerDismissKey(user.id)) === "1");
    } catch {
      setDismissed(false);
    }
  }, [user]);

  if (!user || uid !== user.id || personalized || dismissed) return null;

  const later = () => {
    try { localStorage.setItem(bannerDismissKey(user.id), "1"); } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div className="mb-6 rounded-[20px] border border-primary/30 bg-primary/10 px-5 py-4">
      <p className="text-sm font-semibold text-foreground">Personnalise ton Éclosia 🌸</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Quatre petites questions pour ne voir que ce dont tu as besoin. Rien n'est supprimé.
      </p>
      <div className="mt-3 flex gap-2">
        <Link
          to="/bienvenue?besoins=1&refaire=1"
          className="rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          Personnaliser
        </Link>
        <button onClick={later} className="rounded-full px-4 py-2.5 text-xs font-medium text-muted-foreground">
          Plus tard
        </button>
      </div>
    </div>
  );
};

export default PersonalizeBanner;
