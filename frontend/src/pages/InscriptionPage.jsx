import { useState } from "react";
import { Link } from "react-router-dom";
import { createUser, validateInscriptionPassword } from "../services/InscriptionSerivce";

export default function InscriptionPage() {
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    const formData = new FormData(form);
    const username = String(formData.get("username") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("confirmPassword") ?? "");

    const validation = validateInscriptionPassword(password, passwordConfirm);

    if (!validation.isValid) {
      setSuccessMessage("");
      setErrors(validation.errors);
      return;
    }

    try {
      await createUser({ username, email, password });
      setErrors([]);
      setSuccessMessage("Compte créé avec succès.");
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'inscription.";
      setSuccessMessage("");
      setErrors([message]);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-topbar">
          <Link className="auth-home-link" to="/feed">Home</Link>
        </div>
        <p className="kicker">NotationJV</p>
        <h1>Inscription</h1>
        <p className="subtitle">Crée un compte puis accéde à ton espace.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="username">Nom d'utilisateur</label>
          <input id="username" name="username" type="text" placeholder="JohnDoe" required />

          <label htmlFor="email">Adresse e-mail</label>
          <input id="email" name="email" type="email" placeholder="prenom.nom@exemple.com" required />

          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" placeholder="********" required />

          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input id="confirmPassword" name="confirmPassword" type="password" placeholder="********" required />

          <button type="submit">S'inscrire</button>
        </form>

        {errors.length > 0 && (
          <div className="auth-errors" role="alert" aria-live="polite">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        {successMessage && (
          <p className="auth-success" role="status" aria-live="polite">{successMessage}</p>
        )}

        <p className="helper">
          Deja un compte ? <Link className="auth-link" to="/connexion">Se connecter</Link>
        </p>

      </section>
    </main>
  );
}