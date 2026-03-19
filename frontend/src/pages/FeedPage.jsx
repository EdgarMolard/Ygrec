import { Link } from "react-router-dom";

export default function FeedPage() {
	return (
		<main className="home-page">
			<section className="home-panel">
				<p className="kicker">NotationJV</p>
				<h1>Accueil</h1>
				<p className="subtitle">Hub principal de l'application. Le fil d'actualite sera ajoute plus tard.</p>

				<div className="hub-grid">
					<article className="hub-card">
						<h2>Fil d'actualite</h2>
						<p>Bientot disponible. Cette section affichera les nouvelles publications.</p>
						<span className="hub-badge">En preparation</span>
					</article>

					<article className="hub-card">
						<h2>Compte</h2>
						<p>Accede rapidement a l'authentification.</p>
						<div className="hub-actions">
							<Link className="hub-link" to="/connexion">Connexion</Link>
							<Link className="hub-link" to="/inscription">Inscription</Link>
						</div>
					</article>
				</div>
			</section>
		</main>
	);
}
