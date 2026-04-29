import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import PremiumAuditPanel from "./PremiumAuditPanel";

// ----- Mocks -----
const rpcMock = vi.fn();
const insertMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpcMock(...args),
    from: () => ({ insert: (...args: unknown[]) => insertMock(...args) }),
    auth: { getUser: () => getUserMock() },
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallbackOrOpts?: unknown) => {
      if (typeof fallbackOrOpts === "string") return fallbackOrOpts;
      if (fallbackOrOpts && typeof fallbackOrOpts === "object") {
        const o = fallbackOrOpts as Record<string, unknown>;
        if (typeof o.defaultValue === "string") {
          return (o.defaultValue as string).replace("{{count}}", String(o.count ?? ""));
        }
      }
      return key;
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const ADMIN_ID = "admin-1111-2222-3333";

const auditFull = {
  paid_without_premium: [
    {
      user_id: "user-paid-no-prem",
      payment_id: "tr_PAID1",
      amount: 1900,
      paid_at: "2026-04-01T10:00:00Z",
      is_premium: false,
      email: "paid@example.com",
    },
  ],
  premium_without_paid_log: [
    {
      user_id: "user-prem-no-log",
      email: "prem@example.com",
      plan_type: "paid",
      profile_created_at: "2026-03-15T10:00:00Z",
      profile_updated_at: "2026-04-20T10:00:00Z",
    },
  ],
  already_active: [
    {
      id: "log-aa-1",
      user_id: "user-already-active",
      payment_id: "tr_AA1",
      amount: 1900,
      message: "Already premium, ignored",
      created_at: "2026-04-10T10:00:00Z",
      email: "active@example.com",
    },
  ],
  generated_at: "2026-04-29T08:00:00Z",
};

const auditEmpty = {
  paid_without_premium: [],
  premium_without_paid_log: [],
  already_active: [],
  generated_at: "2026-04-29T08:00:00Z",
};

beforeEach(() => {
  rpcMock.mockReset();
  insertMock.mockReset();
  getUserMock.mockReset();
  getUserMock.mockResolvedValue({ data: { user: { id: ADMIN_ID } } });
  insertMock.mockResolvedValue({ error: null });
});

describe("PremiumAuditPanel — 3 cas d'incohérence", () => {
  it("rend les trois sections distinctes avec les bons compteurs", async () => {
    rpcMock.mockResolvedValue({ data: auditFull, error: null });
    render(<PremiumAuditPanel />);

    await waitFor(() => {
      expect(rpcMock).toHaveBeenCalledWith("get_premium_audit");
    });

    expect(await screen.findByText("paid@example.com")).toBeInTheDocument();
    expect(await screen.findByText("prem@example.com")).toBeInTheDocument();
    expect(await screen.findByText("active@example.com")).toBeInTheDocument();
    // Statut critique = 2 (paid_no_prem + prem_no_log)
    expect(screen.getByText(/2 incohérence\(s\) critique\(s\)/i)).toBeInTheDocument();
  });

  it("affiche un état sain quand toutes les listes sont vides", async () => {
    rpcMock.mockResolvedValue({ data: auditEmpty, error: null });
    render(<PremiumAuditPanel />);
    expect(await screen.findByText(/Tout est cohérent/i)).toBeInTheDocument();
  });

  it("affiche l'erreur quand la RPC échoue (données manquantes)", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "RPC denied" } });
    render(<PremiumAuditPanel />);
    expect(await screen.findByText("RPC denied")).toBeInTheDocument();
    // Aucune section data-driven ne doit apparaître
    expect(screen.queryByText(/Tout est cohérent/i)).not.toBeInTheDocument();
  });

  it("journalise automatiquement chaque alerte (1 insert par anomalie, 3 au total)", async () => {
    rpcMock.mockResolvedValue({ data: auditFull, error: null });
    render(<PremiumAuditPanel />);

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(3));

    const kinds = insertMock.mock.calls.map((c) => (c[0] as any[])[0].error_code);
    expect(kinds).toEqual(
      expect.arrayContaining(["paid_no_premium", "premium_no_log", "already_active"])
    );

    // Diagnostic complet : metadata.target_user_id + payment_id + timestamps
    const paidCall = insertMock.mock.calls.find(
      (c) => (c[0] as any[])[0].error_code === "paid_no_premium"
    )!;
    const meta = (paidCall[0] as any[])[0].metadata;
    expect(meta.target_user_id).toBe("user-paid-no-prem");
    expect(meta.payment_id).toBe("tr_PAID1");
    expect(meta.is_premium).toBe(false);
    expect(meta.log_status).toBe("paid");
    expect(meta.timestamps.audited_at).toBe("2026-04-29T08:00:00Z");
    expect(meta.logged_by_admin).toBe(ADMIN_ID);
  });

  it("ne ré-insère pas un diagnostic déjà enregistré (déduplication intra-session)", async () => {
    rpcMock.mockResolvedValue({ data: auditFull, error: null });
    render(<PremiumAuditPanel />);
    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(3));

    // Re-cliquer sur "Enregistrer" d'une ligne déjà loggée — bouton désactivé
    const buttons = screen.getAllByRole("button");
    const enregistrer = buttons.filter((b) => b.textContent?.includes("Enregistrer"));
    // Tous les boutons "Enregistrer" doivent être désactivés (déjà loggés)
    enregistrer.forEach((b) => expect(b).toBeDisabled());
    expect(insertMock).toHaveBeenCalledTimes(3);
  });
});

describe("PremiumAuditPanel — délai de synchronisation & refetch", () => {
  it("ré-exécute l'audit au clic sur le bouton de refresh", async () => {
    // 1er appel : vide (paiement vient d'être fait, profil pas encore sync)
    rpcMock.mockResolvedValueOnce({ data: auditEmpty, error: null });
    render(<PremiumAuditPanel />);
    expect(await screen.findByText(/Tout est cohérent/i)).toBeInTheDocument();

    // 2e appel : l'incohérence apparaît (sync en retard détectée)
    rpcMock.mockResolvedValueOnce({ data: auditFull, error: null });

    const runBtn = screen.getByRole("button", { name: /admin\.audit\.run/i });
    await act(async () => {
      fireEvent.click(runBtn);
    });

    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("paid@example.com")).toBeInTheDocument();
  });

  it("survit gracieusement à un payload partiellement vide (paid_without_premium manquant)", async () => {
    // Cas réel : DB nouvellement migrée, aucun log encore
    const partial = { ...auditEmpty, premium_without_paid_log: auditFull.premium_without_paid_log };
    rpcMock.mockResolvedValue({ data: partial, error: null });
    render(<PremiumAuditPanel />);

    expect(await screen.findByText("prem@example.com")).toBeInTheDocument();
    // 1 critique seulement
    expect(screen.getByText(/1 incohérence\(s\) critique\(s\)/i)).toBeInTheDocument();
    // Une seule insertion auto
    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
  });
});
