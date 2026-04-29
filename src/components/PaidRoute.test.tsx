import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PaidRoute from "@/components/PaidRoute";

const STABLE_USER = { id: "user-123" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: STABLE_USER, loading: false }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

let currentIsPremium: boolean | null = false;

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { is_premium: currentIsPremium },
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
  beforeEach(() => cleanup());

  describe("Utilisateur payant (is_premium=true)", () => {
    beforeEach(() => { currentIsPremium = true; });
    for (const path of PROTECTED_PATHS) {
      it(`autorise l'accès à ${path}`, async () => {
        renderRoute(path);
        await waitFor(
          () => expect(screen.getByText("PROTECTED_CONTENT_OK")).toBeInTheDocument(),
          { timeout: 3000 },
        );
      });
    }
  });

  describe("Utilisateur non payeur (is_premium=false)", () => {
    beforeEach(() => { currentIsPremium = false; });
    for (const path of PROTECTED_PATHS) {
      it(`redirige depuis ${path} vers /paywall`, async () => {
        renderRoute(path);
        await waitFor(
          () => expect(screen.getByText("REDIRECTED_TO_PAYWALL")).toBeInTheDocument(),
          { timeout: 3000 },
        );
      });
    }
  });

  describe("is_premium null (profil sans valeur)", () => {
    beforeEach(() => { currentIsPremium = null; });
    it("redirige vers /paywall (sécurité par défaut)", async () => {
      renderRoute("/historique");
      await waitFor(() =>
        expect(screen.getByText("REDIRECTED_TO_PAYWALL")).toBeInTheDocument()
      );
    });
  });
});
