import { beforeEach, describe, expect, it, vi } from "vitest";
import { login } from "./ConnexionService";
import { createUser, validateInscriptionPassword } from "./InscriptionSerivce";

describe("services", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("valide un mot de passe robuste", () => {
    const result = validateInscriptionPassword("Abcdefghijk1!", "Abcdefghijk1!");

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("retourne plusieurs erreurs pour un mot de passe faible", () => {
    const result = validateInscriptionPassword("abc", "abc");

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Le mot de passe doit contenir au moins 1 chiffre.");
    expect(result.errors).toContain("Le mot de passe doit contenir au moins 1 lettre majuscule.");
    expect(result.errors).toContain("Le mot de passe doit contenir au moins 1 caractère spécial.");
    expect(result.errors).toContain("Le mot de passe doit contenir au moins 12 caractères.");
  });

  it("retourne la reponse de login si la requete reussit", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Connexion réussie" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(login("alice", "secret")).resolves.toEqual({ message: "Connexion réussie" });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username: "alice", password: "secret" }),
    });
  });

  it("traduit un conflit createUser en message explicite", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ code: "USERNAME_ALREADY_USED" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createUser({
        username: "alice",
        email: "alice@example.com",
        password: "Abcdefghijk1!",
      })
    ).rejects.toThrow("Le nom d'utilisateur est déjà utilisé.");
  });
});
