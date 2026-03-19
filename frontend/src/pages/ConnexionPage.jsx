import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/ConnexionService";

export default function ConnexionPage() {
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await login(username, password);
      setErrors([]);
      setSuccessMessage("Connexion reussie.");
      form.reset();
      navigate("/feed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la connexion.";
      setSuccessMessage("");
      setErrors([message]);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="kicker">NotationJV</p>
        <h1>Connexion</h1>
        <p className="subtitle">Connecte-toi pour acceder a ton espace.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="username">Nom d'utilisateur</label>
          <input id="username" name="username" type="text" placeholder="JohnDoe" required />

          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" placeholder="********" required />

          <button type="submit">Se connecter</button>
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
          Pas encore de compte ? <Link className="auth-link" to="/inscription">S'inscrire</Link>
        </p>

      </section>
    </main>
  );
}