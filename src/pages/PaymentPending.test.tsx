import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PaymentPending from "@/pages/PaymentPending";

const STABLE_USER = { id: "user-123", email: "user@example.com" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: STABLE_USER, loading: false }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

// framer-motion: render plain divs to avoid animation timing in tests
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: () => (props: any) => {
        const { children, ...rest } = props ?? {};
        return <div {...rest}>{children}</div>;
      },
    },
  ),
}));

// State controlled per test
let currentIsPremium: boolean | null = true;
let returnNullProfile = false;

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: () => Promise.resolve({ error: null }),
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: returnNullProfile ? null : { is_premium: currentIsPremium },
              error: null,
            }),
        }),
      }),
    }),
  },
}));

// Bypass retry/backoff/timeouts and call the query directly
vi.mock("@/lib/supabaseRetry", () => ({
  withRetry: async (fn: () => Promise<any>) => {
    const res = await fn();
    return { ...res, transientFailure: false };
  },
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/payment-pending"]}>
      <Routes>
        <Route path="/payment-pending" element={<PaymentPending />} />
        <Route
          path="/payment-success"
          element={<div>REDIRECTED_TO_PAYMENT_SUCCESS</div>}
        />
        <Route path="/auth" element={<div>REDIRECTED_TO_AUTH</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("PaymentPending — redirection immédiate si déjà premium", () => {
  beforeEach(() => {
    cleanup();
    currentIsPremium = true;
    returnNullProfile = false;
  });

  it("redirige vers /payment-success quand is_premium est déjà true à l'arrivée", async () => {
    renderPage();
    await waitFor(
      () =>
        expect(
          screen.getByText("REDIRECTED_TO_PAYMENT_SUCCESS"),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it("ne redirige PAS vers /payment-success si is_premium est false (reste en attente)", async () => {
    currentIsPremium = false;
    renderPage();
    // Affiche bien l'état "en attente" et ne navigue pas vers /payment-success
    await waitFor(() =>
      expect(
        screen.getByText("payment_pending.pending.title"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByText("REDIRECTED_TO_PAYMENT_SUCCESS"),
    ).not.toBeInTheDocument();
  });

  it("affiche l'état 'profil introuvable' si la ligne profil n'existe pas (pas de redirection)", async () => {
    returnNullProfile = true;
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Profil introuvable")).toBeInTheDocument(),
    );
    expect(
      screen.queryByText("REDIRECTED_TO_PAYMENT_SUCCESS"),
    ).not.toBeInTheDocument();
  });
});
