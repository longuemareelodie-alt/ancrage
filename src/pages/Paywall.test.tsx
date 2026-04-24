import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Paywall from "@/pages/Paywall";

// Mocks des dépendances applicatives non pertinentes pour ce test.
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/hooks/useMolliePayment", () => ({
  useMolliePayment: () => ({ startPayment: vi.fn(), loading: false }),
}));

const renderPaywall = () =>
  render(
    <MemoryRouter initialEntries={["/paywall"]}>
      <Routes>
        <Route path="/paywall" element={<Paywall />} />
        <Route path="/cgv" element={<div>PAGE_CGV</div>} />
        <Route
          path="/confidentialite"
          element={<div>PAGE_CONFIDENTIALITE</div>}
        />
        <Route path="/mentions-legales" element={<div>PAGE_MENTIONS</div>} />
      </Routes>
    </MemoryRouter>
  );

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event("resize"));
};

const findLinkByHref = (href: string) =>
  screen.getAllByRole("link").find((a) => a.getAttribute("href") === href);

describe("Paywall — liens légaux", () => {
  beforeEach(() => {
    setViewport(1280, 800);
  });

  describe("Présence et attributs des liens", () => {
    it("affiche un lien CGV pointant vers /cgv", () => {
      renderPaywall();
      const link = findLinkByHref("/cgv");
      expect(link).toBeDefined();
      expect(link!).toBeVisible();
    });

    it("affiche un lien Politique de confidentialité pointant vers /confidentialite", () => {
      renderPaywall();
      const link = findLinkByHref("/confidentialite");
      expect(link).toBeDefined();
      expect(link!).toBeVisible();
    });

    it("affiche un lien Mentions légales pointant vers /mentions-legales", () => {
      renderPaywall();
      const link = findLinkByHref("/mentions-legales");
      expect(link).toBeDefined();
      expect(link!).toBeVisible();
    });

    it("les 3 liens légaux sont présents simultanément (URL cohérentes)", () => {
      renderPaywall();
      const hrefs = screen
        .getAllByRole("link")
        .map((a) => a.getAttribute("href"));
      expect(hrefs).toEqual(
        expect.arrayContaining(["/cgv", "/confidentialite", "/mentions-legales"])
      );
    });
  });

  describe("Navigation au clic — desktop (1280x800)", () => {
    it("clique sur le lien CGV et navigue vers /cgv", async () => {
      const user = userEvent.setup();
      renderPaywall();
      await user.click(findLinkByHref("/cgv")!);
      expect(await screen.findByText("PAGE_CGV")).toBeInTheDocument();
    });

    it("clique sur le lien Confidentialité et navigue", async () => {
      const user = userEvent.setup();
      renderPaywall();
      await user.click(findLinkByHref("/confidentialite")!);
      expect(
        await screen.findByText("PAGE_CONFIDENTIALITE")
      ).toBeInTheDocument();
    });

    it("clique sur le lien Mentions légales et navigue", async () => {
      const user = userEvent.setup();
      renderPaywall();
      await user.click(findLinkByHref("/mentions-legales")!);
      expect(await screen.findByText("PAGE_MENTIONS")).toBeInTheDocument();
    });
  });

  describe("Navigation au clic — viewport mobile (375x812)", () => {
    beforeEach(() => {
      setViewport(375, 812);
    });

    const targets = [
      { href: "/cgv", expected: "PAGE_CGV" },
      { href: "/confidentialite", expected: "PAGE_CONFIDENTIALITE" },
      { href: "/mentions-legales", expected: "PAGE_MENTIONS" },
    ] as const;

    for (const { href, expected } of targets) {
      it(`le lien ${href} est cliquable et navigue en mobile`, async () => {
        const user = userEvent.setup();
        renderPaywall();

        const link = findLinkByHref(href);
        expect(link).toBeDefined();
        expect(link!).toBeVisible();

        const styles = window.getComputedStyle(link!);
        expect(styles.pointerEvents).not.toBe("none");
        expect(styles.display).not.toBe("none");
        expect(styles.visibility).not.toBe("hidden");

        await user.click(link!);
        expect(await screen.findByText(expected)).toBeInTheDocument();

        cleanup();
      });
    }
  });
});
