import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PaidRoute from "@/components/PaidRoute";

// Mock auth — always logged in for these tests
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-123" },
    loading: false,
  }),
}));

// Programmable plan_type returned by the mocked Supabase client
let currentPlanType: string | null = "none";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { plan_type: currentPlanType },
              error: null,
            }),
        }),
      }),
    }),
  },
}));

const PROTECTED_PATHS = [
  "/historique",
  "/comprendre",
  "/avancer",
  "/sante",
  "/sante/rendez-vous",
  "/sante/medicaments",
  "/sante/fiche-medicale",
  "/sante/ressources",
];

const renderRoute = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path={path}
          element={
            <PaidRoute>
              <div>PROTECTED_CONTENT_OK</div>
            </PaidRoute>
          }
        />
        <Route path="/paywall" element={<div>REDIRECTED_TO_PAYWALL</div>} />
        <Route path="/auth" element={<div>REDIRECTED_TO_AUTH</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("PaidRoute — accès des payeurs aux routes protégées", () => {
  beforeEach(() => {
    cleanup();
  });

  describe("Utilisateur lifetime (paiement unique 39€)", () => {
    beforeEach(() => {
      currentPlanType = "lifetime";
    });

    for (const path of PROTECTED_PATHS) {
      it(`autorise l'accès à ${path}`, async () => {
        renderRoute(path);
        await waitFor(() =>
          expect(screen.getByText("PROTECTED_CONTENT_OK")).toBeInTheDocument()
        );
        expect(screen.queryByText("REDIRECTED_TO_PAYWALL")).toBeNull();
      });
    }
  });

  describe("Utilisateur avec ancien abonnement (legacy)", () => {
    beforeEach(() => {
      currentPlanType = "subscription";
    });

    for (const path of PROTECTED_PATHS) {
      it(`autorise l'accès à ${path}`, async () => {
        renderRoute(path);
        await waitFor(() =>
          expect(screen.getByText("PROTECTED_CONTENT_OK")).toBeInTheDocument()
        );
        expect(screen.queryByText("REDIRECTED_TO_PAYWALL")).toBeNull();
      });
    }
  });

  describe("Utilisateur non payeur", () => {
    beforeEach(() => {
      currentPlanType = "none";
    });

    for (const path of PROTECTED_PATHS) {
      it(`redirige depuis ${path} vers /paywall`, async () => {
        renderRoute(path);
        await waitFor(() =>
          expect(screen.getByText("REDIRECTED_TO_PAYWALL")).toBeInTheDocument()
        );
        expect(screen.queryByText("PROTECTED_CONTENT_OK")).toBeNull();
      });
    }
  });

  describe("plan_type null (profil sans valeur)", () => {
    beforeEach(() => {
      currentPlanType = null;
    });

    it("redirige vers /paywall (sécurité par défaut)", async () => {
      renderRoute("/historique");
      await waitFor(() =>
        expect(screen.getByText("REDIRECTED_TO_PAYWALL")).toBeInTheDocument()
      );
    });
  });
});
