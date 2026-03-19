import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/ConnexionService";

export default function FeedPage() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [actionError, setActionError] = useState("");
	const navigate = useNavigate();
	const username = useMemo(() => localStorage.getItem("username") ?? "", []);
	const isConnected = username.length > 0;

	const handleLogout = async () => {
		try {
			await logout();
			setIsMenuOpen(false);
			navigate("/connexion");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erreur lors de la deconnexion.";
			setActionError(message);
		}
	};

	return (
		<main className="home-page">
			<section className="home-panel">
				<div className="home-topbar">
					{isConnected ? (
						<div className="user-menu">
							<button
								type="button"
								className="user-trigger"
								onClick={() => setIsMenuOpen((prev) => !prev)}
							>
								{username}
							</button>
							{isMenuOpen && (
								<div className="user-dropdown">
									<button type="button" className="menu-item" disabled>
										Mon Profil (bientot)
									</button>
									<button type="button" className="menu-item menu-item-danger" onClick={handleLogout}>
										Se deconnecter
									</button>
								</div>
							)}
						</div>
					) : (
						<div className="hub-actions">
							<Link className="hub-link" to="/connexion">Connexion</Link>
							<Link className="hub-link" to="/inscription">Inscription</Link>
						</div>
					)}
				</div>

				<p className="kicker">NotationJV</p>
				<h1>Accueil</h1>
				<p className="subtitle">Hub principal de l'application. Le fil d'actualite sera ajoute plus tard.</p>
				{actionError && <p className="auth-errors">{actionError}</p>}

				<div className="hub-grid">
					<article className="hub-card">
						<h2>Fil d'actualite</h2>
						<p>Bientot disponible. Cette section affichera les nouvelles publications.</p>
						<span className="hub-badge">En preparation</span>
					</article>

					<article className="hub-card">
						<h2>Compte</h2>
						{isConnected ? (
							<p>Tu es connecte en tant que {username}.</p>
						) : (
							<>
								<p>Accede rapidement a l'authentification.</p>
								<div className="hub-actions">
									<Link className="hub-link" to="/connexion">Connexion</Link>
									<Link className="hub-link" to="/inscription">Inscription</Link>
								</div>
							</>
						)}
					</article>
				</div>
			</section>
		</main>
	);
}
