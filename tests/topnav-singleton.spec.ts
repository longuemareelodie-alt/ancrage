import { test, expect } from "../playwright-fixture";

/**
 * Vérifie qu'il n'existe jamais deux <TopNav /> montés simultanément
 * lors d'une navigation typique : accueil → ancre #faq → /cgv → retour /#faq.
 *
 * Le composant TopNav rend un unique <header> sticky (role="banner").
 * Sa nav interne porte aria-label="Navigation principale" (i18n `nav.main`).
 *
 * En dev, TopNav affiche aussi un bandeau d'alerte si plusieurs instances
 * sont montées : on s'assure qu'il n'apparaît jamais.
 */
test.describe("TopNav singleton", () => {
  test("reste unique pendant la navigation /#faq → /cgv → /#faq", async ({
    page,
  }) => {
    const expectSingleTopNav = async (label: string) => {
      // En-tête sticky unique
      const headers = page.locator("header.sticky");
      await expect(headers, `unique header sticky (${label})`).toHaveCount(1);

      // Aucun bandeau de duplication dev
      const dupBadge = page.getByRole("alert", {
        name: /barres TopNav montées simultanément/i,
      });
      await expect(
        dupBadge,
        `pas de bandeau de duplication (${label})`,
      ).toHaveCount(0);
    };

    // 1) Accueil + ancre FAQ
    await page.goto("/#faq");
    await page.waitForLoadState("networkidle");
    await expectSingleTopNav("/#faq initial");

    // 2) Navigation vers /cgv (page publique avec breadcrumb non-sticky)
    await page.goto("/cgv");
    await page.waitForLoadState("networkidle");
    await expectSingleTopNav("/cgv");

    // 3) Retour sur /#faq
    await page.goto("/#faq");
    await page.waitForLoadState("networkidle");
    await expectSingleTopNav("/#faq retour");

    // 4) Pour finir, navigation client-side (lien interne) vers / puis re-ancre
    //    — couvre le cas SPA sans full reload, qui était la source du bug initial.
    await page.evaluate(() => {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.waitForTimeout(500);
    await expectSingleTopNav("retour SPA /");

    await page.evaluate(() => {
      window.history.pushState({}, "", "/#faq");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await page.waitForTimeout(500);
    await expectSingleTopNav("ancre SPA /#faq");
  });
});
