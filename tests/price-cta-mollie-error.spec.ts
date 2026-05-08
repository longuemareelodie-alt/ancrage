import { test, expect } from "../playwright-fixture";

/**
 * E2E : si l'edge function `create-mollie-payment` renvoie une erreur,
 * le front doit afficher un message d'erreur convivial (toast Sonner) et
 * NE PAS rediriger l'utilisateur vers Mollie ni quitter la page courante.
 */

test.describe("Price CTA → Mollie (error path)", () => {
  test.beforeEach(async ({ context }) => {
    // Pré-ferme l'onboarding pour ne pas bloquer le CTA.
    await context.addInitScript(() => {
      try {
        localStorage.setItem("ancrage.parentTypeChosen", "1");
        localStorage.setItem("ancrage.schoolContextChosen", "1");
      } catch {
        /* noop */
      }
    });

    // Stub l'edge function en erreur 500.
    await context.route("**/functions/v1/create-mollie-payment", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal error" }),
      });
    });

    // Garde-fou : si jamais le front tentait quand même d'aller chez Mollie,
    // on l'intercepte pour ne pas charger le vrai site.
    await context.route("https://www.mollie.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "stub" }),
    );
  });

  const dismissOnboardingIfPresent = async (
    page: import("@playwright/test").Page,
  ) => {
    const skip = page
      .getByRole("button", { name: /plus tard|fermer|✕/i })
      .first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }
  };

  test("/comparaison : erreur 500 → toast d'erreur, aucune redirection", async ({
    page,
  }) => {
    page.on("dialog", (dialog) => dialog.accept("cliente@example.com"));
    await page.goto("/comparaison");
    await page.waitForLoadState("domcontentloaded");
    await dismissOnboardingIfPresent(page);

    const startUrl = page.url();

    const cta = page.getByRole("button", {
      name: /je veux me sentir mieux.*59/i,
    });
    await expect(cta).toBeVisible();

    const [request] = await Promise.all([
      page.waitForRequest("**/functions/v1/create-mollie-payment"),
      cta.click(),
    ]);
    expect(request.method()).toBe("POST");

    // Un toast Sonner doit apparaître avec un message convivial en français.
    const toast = page
      .locator("[data-sonner-toast]", {
        hasText: /erreur|réessaie|paiement/i,
      })
      .first();
    await expect(toast, "un toast d'erreur convivial doit s'afficher").toBeVisible({
      timeout: 5_000,
    });

    // On laisse passer un instant pour détecter une éventuelle redirection.
    await page.waitForTimeout(500);
    expect(
      page.url(),
      "l'utilisateur ne doit pas être redirigé en cas d'erreur",
    ).toBe(startUrl);

    // Le bouton doit redevenir cliquable (loading=false).
    await expect(cta).toBeEnabled();
  });
});
