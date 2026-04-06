import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Download, X } from "lucide-react";

/**
 * Detects if user is on iOS and the app is NOT installed as PWA.
 * Shows a guide to install for push notification support.
 */
const InstallPWAPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("pwa_install_dismissed")) return;

    // Check if already in standalone mode (installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    if (isStandalone) return;

    // Only show on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Show after a short delay
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-card p-5 shadow-lg border border-border"
      >
        <button onClick={dismiss} className="absolute right-3 top-3 text-muted-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
            {isIOS ? <Share className="h-5 w-5 text-primary" /> : <Download className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              Installe Ancrage sur ton téléphone
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {isIOS ? (
                <>
                  Pour recevoir les rappels quotidiens sur iPhone :<br />
                  1. Appuie sur <Share className="inline h-3 w-3" /> en bas de Safari<br />
                  2. Choisis « Sur l'écran d'accueil »<br />
                  3. Active ensuite les notifications dans ton profil
                </>
              ) : (
                <>
                  Appuie sur le menu de ton navigateur (⋮) puis « Installer l'application » ou « Ajouter à l'écran d'accueil » pour recevoir les rappels quotidiens.
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPWAPrompt;
