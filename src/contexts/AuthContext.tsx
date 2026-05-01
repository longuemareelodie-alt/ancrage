import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { pullStyleFromRemote } from "@/lib/actionStyle";
import { pullParentTypeFromRemote } from "@/lib/parentType";
import { withRetry } from "@/lib/supabaseRetry";
import { classifyProfileCreatedAt, isGrandfatheredAccount } from "@/lib/paywallPolicy";

type EligibilityPhase = "idle" | "checking" | "ready" | "error";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  /** True until BOTH the auth session AND (when logged in) premium eligibility have been resolved. */
  loading: boolean;
  /** True if the user is allowed into paid pages (premium or grandfathered). null while unknown. */
  isPaid: boolean | null;
  /** True if the user has access to the 7-day initiation (premium, grandfathered, or paid 4,99€). null while unknown. */
  hasInitiation: boolean | null;
  /** Status of the eligibility check itself. */
  eligibilityPhase: EligibilityPhase;
  /** Force a re-check (e.g. after returning from payment). */
  refreshEligibility: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isPaid: null,
  hasInitiation: null,
  eligibilityPhase: "idle",
  refreshEligibility: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [hasInitiation, setHasInitiation] = useState<boolean | null>(null);
  const [eligibilityPhase, setEligibilityPhase] = useState<EligibilityPhase>("idle");
  const checkSeqRef = useRef(0);
  // Remember which user ids we've already warned about so we don't spam logs.
  const loggedAnomaliesRef = useRef<Set<string>>(new Set());

  const checkEligibility = useCallback(async (userId: string | null) => {
    const seq = ++checkSeqRef.current;
    if (!userId) {
      setIsPaid(null);
      setHasInitiation(null);
      setEligibilityPhase("idle");
      return;
    }
    setEligibilityPhase("checking");
    const result = await withRetry(
      () =>
        supabase
          .from("profiles")
          .select("is_premium, created_at, has_initiation_access")
          .eq("user_id", userId)
          .maybeSingle(),
      { maxAttempts: 4, baseDelayMs: 500 },
    );
    // Ignore stale responses (user changed in the meantime)
    if (seq !== checkSeqRef.current) return;

    if (result.transientFailure) {
      setIsPaid(null);
      setHasInitiation(null);
      setEligibilityPhase("error");
      return;
    }
    const profile = result.data as {
      is_premium?: boolean;
      created_at?: string;
      has_initiation_access?: boolean;
    } | null;
    const premium = !!profile?.is_premium;

    // Diagnose anomalies on profile.created_at — they break the grandfather
    // check silently otherwise. We log once per user id, per session.
    const createdAtStatus = profile
      ? classifyProfileCreatedAt(profile.created_at)
      : "missing";
    if (createdAtStatus !== "valid" && !loggedAnomaliesRef.current.has(userId)) {
      loggedAnomaliesRef.current.add(userId);
      const reason = profile
        ? `profile.created_at is ${createdAtStatus} (value=${JSON.stringify(profile.created_at)})`
        : "profile row missing for this user";
      // eslint-disable-next-line no-console
      console.warn(
        `[eligibility] ${reason}; user_id=${userId}. Falling back to NOT grandfathered (paywall enforced).`,
      );
    }

    const grandfathered = isGrandfatheredAccount(profile?.created_at);
    const paid = premium || grandfathered;
    setIsPaid(paid);
    setHasInitiation(paid || !!profile?.has_initiation_access);
    setEligibilityPhase("ready");
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setAuthLoading(false);
        const uid = nextSession?.user?.id ?? null;
        // Reset paid state immediately on auth change so old value never leaks across users.
        setIsPaid(null);
        setHasInitiation(null);
        setEligibilityPhase(uid ? "checking" : "idle");
        void checkEligibility(uid);
        if (nextSession?.user) {
          setTimeout(() => { void pullStyleFromRemote(); }, 0);
          setTimeout(() => { void pullParentTypeFromRemote(); }, 0);
        }
      },
    );

    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial);
      setAuthLoading(false);
      const uid = initial?.user?.id ?? null;
      setEligibilityPhase(uid ? "checking" : "idle");
      void checkEligibility(uid);
      if (initial?.user) {
        setTimeout(() => { void pullStyleFromRemote(); }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkEligibility]);

  const refreshEligibility = useCallback(async () => {
    await checkEligibility(session?.user?.id ?? null);
  }, [checkEligibility, session?.user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Combined loading: auth not resolved yet, OR (logged in AND eligibility still pending).
  const loading =
    authLoading ||
    (!!session?.user && (eligibilityPhase === "idle" || eligibilityPhase === "checking"));

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isPaid,
        hasInitiation,
        eligibilityPhase,
        refreshEligibility,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
