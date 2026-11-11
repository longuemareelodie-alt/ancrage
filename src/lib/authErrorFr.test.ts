import { describe, it, expect } from "vitest";
import { authErrorFr } from "./authErrorFr";

describe("authErrorFr", () => {
  it("mauvais mot de passe → message en français", () => {
    expect(authErrorFr({ message: "Invalid login credentials" })).toBe(
      "Adresse e-mail ou mot de passe incorrect.",
    );
  });
  it("trop d'essais → attendre une minute", () => {
    expect(authErrorFr({ message: "Request rate limit reached" })).toBe(
      "Trop d'essais d'affilée. Attends une minute puis réessaie.",
    );
  });
  it("un message anglais inconnu n'est jamais affiché brut", () => {
    expect(authErrorFr({ message: "Something odd happened" }, "Repli")).toBe("Repli");
  });
});
