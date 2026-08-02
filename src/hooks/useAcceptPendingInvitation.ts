import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { acceptPendingInvitation, getPendingInvitation } from "@/lib/familyInvitations";

/**
 * Dès qu'une session existe, on consomme discrètement l'invitation gardée
 * de côté. Aucune interface : la personne n'a rien à confirmer deux fois.
 */
export const useAcceptPendingInvitation = () => {
  const { user } = useAuth();
  const doneForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    if (doneForRef.current === user.id) return;
    if (!getPendingInvitation()) return;
    doneForRef.current = user.id;
    void acceptPendingInvitation();
  }, [user?.id]);
};
