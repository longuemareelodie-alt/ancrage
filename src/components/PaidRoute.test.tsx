import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PaidRoute from "@/components/PaidRoute";

const STABLE_USER = { id: "user-123" };

// Eligibility now lives in AuthContext. Tests drive PaidRoute by setting the
// mocked context values.
let mockIsPaid: boolean | null = false;
let mockEligibilityPhase: "idle" | "checking" | "ready" | "error" = "ready";
let mockLoading = false;

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: STABLE_USER,
    loading: mockLoading,
    isPaid: mockIsPaid,
    eligibilityPhase: mockEligibilityPhase,
    refreshEligibility: vi.fn(),
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

// Keep this list in sync with src/App.tsx — every route wrapped in <PaidRoute>.
const PROTECTED_PATHS = [
  "/dashboard",
  "/calme",
  "/emotions",
  "/emotion/joie",
  "/checkin",
  "/historique",
  "/comprendre",
  "/avancer",
  "/parcours",
  "/profil",
  "/profil/style",
  "/sante",
  "/sante/rendez-vous",
  "/sante/medicaments",
  "/sante/fiche-medicale",
  "/sante/ressources",
  "/urgence",
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
    </MemoryRouter>,
  );

describe("PaidRoute — accès des payeurs aux routes protégées", () => {
  beforeEach(() => {
    cleanup();
    mockLoading = false;
    mockEligibilityPhase = "ready";
  });

  describe("Utilisateur payant (isPaid=true)", () => {
    beforeEach(() => {
      mockIsPaid = true;
    });
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

  describe("Utilisateur non payeur (isPaid=false)", () => {
    beforeEach(() => {
      mockIsPaid = false;
    });
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

  describe("isPaid null (statut inconnu après vérif)", () => {
    beforeEach(() => {
      mockIsPaid = null;
    });
    it("redirige vers /paywall (sécurité par défaut)", async () => {
      renderRoute("/historique");
      await waitFor(() =>
        expect(screen.getByText("REDIRECTED_TO_PAYWALL")).toBeInTheDocument(),
      );
    });
  });

  describe("Chargement en cours (loading=true)", () => {
    beforeEach(() => {
      mockLoading = true;
      mockIsPaid = null;
      mockEligibilityPhase = "checking";
    });
    it("ne rend PAS le contenu protégé tant que le statut n'est pas connu", () => {
      renderRoute("/historique");
      expect(screen.queryByText("PROTECTED_CONTENT_OK")).not.toBeInTheDocument();
      expect(screen.queryByText("REDIRECTED_TO_PAYWALL")).not.toBeInTheDocument();
    });
  });
});
