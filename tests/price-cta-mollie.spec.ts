import { test, expect } from "../playwright-fixture";

/**
 * E2E : on doit pouvoir cliquer sur les CTA de prix (59€) sans qu'aucun
 * overlay (modal d'onboarding parent/école, dialog, etc.) ne bloque le clic,
 * et atterrir sur le flow de paiement Mollie.
 *
 * Comme Mollie est un domaine externe, on intercepte la création de paiement
 * et on stub la réponse pour que le front redirige vers une URL Mollie connue,
 * puis on vérifie que la navigation y conduit bien.
 */

const MOCK_CHECKOUT_URL = "https://www.mollie.com/checkout/test-tr_FAKE123";

test.describe("Price CTA → Mollie", () => {
  test.beforeEach(async ({ context }) => {
    // Marque l'onboarding comme déjà vu pour ne pas bloquer les CTA derrière
    // le modal `ParentTypeOnboarding`. Si malgré tout il s'affiche, le test
    // doit pouvoir le fermer (vérifié plus bas).
    await context.addInitScript(() => {
      try {
        localStorage.setItem("ancrage.parentTypeChosen", "1");
        localStorage.setItem("ancrage.schoolContextChosen", "1");
      } catch {
        /* noop */
      }
    });

    // Stub de l'edge function `create-mollie-payment` : on retourne une
    // checkoutUrl factice que le front va suivre via window.location.href.
    await context.route("**/functions/v1/create-mollie-payment", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          checkoutUrl: MOCK_CHECKOUT_URL,
          paymentId: "tr_FAKE123",
          status: "open",
        }),
      });
    });

    // On bloque la navigation réelle vers Mollie pour ne pas charger leur site
    // (offline / flaky), tout en laissant l'URL changer côté navigateur.
    await context.route("https://www.mollie.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>Mollie checkout (stub)</body></html>",
      }),
    );
  });

  /**
   * Force la fermeture du modal d'onboarding s'il s'affiche malgré le seed
   * localStorage (cas d'une nouvelle clé / refacto future).
   */
  const dismissOnboardingIfPresent = async (page: import("@playwright/test").Page) => {
    const skip = page.getByRole("button", { name: /plus tard|fermer|✕/i }).first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }
  };

  test("/comparaison : le CTA 59€ déclenche la création de paiement et redirige vers Mollie", async ({
    page,
  }) => {
    page.on("dialog", (dialog) => dialog.accept("cliente@example.com"));
    await page.goto("/comparaison");
    await page.waitForLoadState("domcontentloaded");
    await dismissOnboardingIfPresent(page);

    const cta = page.getByRole("button", { name: /je veux me sentir mieux.*59/i });
    await expect(cta, "le CTA prix doit être visible").toBeVisible();

    // On capture la requête vers l'edge function pour s'assurer qu'elle a bien
    // été appelée (= aucun overlay n'a intercepté le clic).
    const [request] = await Promise.all([
      page.waitForRequest("**/functions/v1/create-mollie-payment"),
      cta.click(),
    ]);
    expect(request.method()).toBe("POST");

    // La redirection vers Mollie doit se produire suite à la réponse stubée.
    await page.waitForURL(MOCK_CHECKOUT_URL, { timeout: 10_000 });
    expect(page.url()).toBe(MOCK_CHECKOUT_URL);
  });

  test("Accueil (/) : le CTA hero 59€ ne doit jamais être bloqué et redirige vers Mollie", async ({
    page,
  }) => {
    page.on("dialog", (dialog) => dialog.accept("cliente@example.com"));
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await dismissOnboardingIfPresent(page);

    // Récupère le premier CTA "Je veux me sentir mieux — 59€" (hero).
    const cta = page
      .getByRole("button", { name: /je veux me sentir mieux.*59/i })
      .first();
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();

    // Vérifie qu'aucun élément couvre le centre du bouton (overlay bloquant).
    const blocked = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      return top !== el && !el.contains(top);
    });
    expect(blocked, "aucun overlay ne doit recouvrir le CTA prix").toBe(false);

    const [request] = await Promise.all([
      page.waitForRequest("**/functions/v1/create-mollie-payment"),
      cta.click(),
    ]);
    expect(request.method()).toBe("POST");

    await page.waitForURL(MOCK_CHECKOUT_URL, { timeout: 10_000 });
    expect(page.url()).toBe(MOCK_CHECKOUT_URL);
  });
});
