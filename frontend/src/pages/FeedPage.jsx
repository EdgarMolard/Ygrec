import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../services/ConnexionService";
import { fetchAvis, createAvis } from "../services/AvisService";
import ReviewCard from "../components/ReviewCard";
import "../styles/FeedPage.css";

export default function FeedPage() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [actionError, setActionError] = useState("");
	const navigate = useNavigate();
	const username = useMemo(() => localStorage.getItem("username") ?? "", []);
	const userId = useMemo(() => localStorage.getItem("userId") ?? "", []);
	const isConnected = username.length > 0;

	// États pour les avis
	const [reviews, setReviews] = useState([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [error, setError] = useState("");
	const observerTarget = useRef(null);
	const isLoadingRef = useRef(false);
	const loadedPagesRef = useRef(new Set());
	const [createForm, setCreateForm] = useState({
		nom_jeu: "",
		titre: "",
		message: "",
		stars: 5,
		nombre_heures: 0,
	});
	const [isCreating, setIsCreating] = useState(false);
	const [createError, setCreateError] = useState("");

	// Charger les avis
	const loadMore = useCallback(async () => {
		if (isLoadingRef.current) return;
		if (loadedPagesRef.current.has(page)) return;

		isLoadingRef.current = true;
		loadedPagesRef.current.add(page);
		setLoading(true);
		setError("");
		try {
			const response = await fetchAvis(page, 10);
			setReviews((prev) => {
				const merged = [...prev, ...response.data];
				const uniqueById = new Map();
				merged.forEach((item) => uniqueById.set(item.id, item));
				return Array.from(uniqueById.values());
			});
			setHasMore(page < response.pagination.pages);
			setPage((prev) => prev + 1);
		} catch (err) {
			loadedPagesRef.current.delete(page);
			// On bloque l'auto-chargement pour eviter une boucle de requetes si l'API est en erreur.
			setHasMore(false);
			setError(err instanceof Error ? err.message : "Erreur lors du chargement des avis");
		} finally {
			isLoadingRef.current = false;
			setLoading(false);
		}
	}, [page]);

	const reloadReviews = useCallback(async () => {
		loadedPagesRef.current = new Set();
		isLoadingRef.current = true;
		setReviews([]);
		setPage(1);
		setHasMore(true);
		setError("");
		setLoading(true);

		try {
			const response = await fetchAvis(1, 10);
			const uniqueById = new Map();
			response.data.forEach((item) => uniqueById.set(item.id, item));
			setReviews(Array.from(uniqueById.values()));
			loadedPagesRef.current.add(1);
			setHasMore(1 < response.pagination.pages);
			setPage(2);
		} catch (err) {
			setHasMore(false);
			setError(err instanceof Error ? err.message : "Erreur lors du chargement des avis");
		} finally {
			isLoadingRef.current = false;
			setLoading(false);
		}
	}, []);

	// Premier chargement
	useEffect(() => {
		loadMore();
	}, []);

	// Infinite scroll avec Intersection Observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					loadMore();
				}
			},
			{ threshold: 0.1 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => {
			if (observerTarget.current) {
				observer.unobserve(observerTarget.current);
			}
		};
	}, [loadMore, hasMore, loading]);

	const handleLogout = async () => {
		try {
			await logout();
			setIsMenuOpen(false);
			navigate("/connexion");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Erreur lors de la deconnexion.";
			setActionError(message);
		}
	};

	const handleCommentSuccess = () => {
		// Recharger les avis pour afficher le nouveau commentaire
		reloadReviews();
	};

	const handleDeleteSuccess = () => {
		reloadReviews();
	};

	const handleRetry = () => {
		// Re-active le chargement manuel apres une erreur reseau/API.
		setHasMore(true);
		loadMore();
	};

	const handleCreateInputChange = (event) => {
		const { name, value } = event.target;
		setCreateForm((prev) => ({
			...prev,
			[name]: name === "stars" || name === "nombre_heures" ? Number(value) : value,
		}));
	};

	const handleCreateAvis = async (event) => {
		event.preventDefault();
		setCreateError("");

		if (!createForm.nom_jeu.trim() || !createForm.titre.trim() || !createForm.message.trim()) {
			setCreateError("Tous les champs texte sont obligatoires.");
			return;
		}

		if (createForm.stars < 0 || createForm.stars > 5) {
			setCreateError("La note doit etre comprise entre 0 et 5.");
			return;
		}

		if (!Number.isInteger(createForm.nombre_heures) || createForm.nombre_heures < 0) {
			setCreateError("Le nombre d'heures doit etre un entier positif.");
			return;
		}

		setIsCreating(true);
		try {
			await createAvis(createForm);
			setCreateForm({ nom_jeu: "", titre: "", message: "", stars: 5, nombre_heures: 0 });
			await reloadReviews();
		} catch (err) {
			setCreateError(err instanceof Error ? err.message : "Erreur lors de la creation de l'avis");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<main className="feed-page">
			<section className="feed-panel">
				<div className="feed-topbar">
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

				<div className="feed-header">
					<h1>Fil d'actualité</h1>
					<p>Découvrez les avis des joueurs</p>
				</div>

				{isConnected && (
					<form className="create-review-form" onSubmit={handleCreateAvis}>
						<h2>Poster un avis</h2>
						<div className="create-review-grid">
							<input
								type="text"
								name="nom_jeu"
								placeholder="Nom du jeu"
								value={createForm.nom_jeu}
								onChange={handleCreateInputChange}
								required
							/>
							<input
								type="text"
								name="titre"
								placeholder="Titre de l'avis"
								value={createForm.titre}
								onChange={handleCreateInputChange}
								required
							/>
							<input
								type="number"
								name="stars"
								min="0"
								max="5"
								step="0.5"
								placeholder="Note /5"
								value={createForm.stars}
								onChange={handleCreateInputChange}
								required
							/>
							<input
								type="number"
								name="nombre_heures"
								min="0"
								step="1"
								placeholder="Heures jouees"
								value={createForm.nombre_heures}
								onChange={handleCreateInputChange}
								required
							/>
						</div>
						<textarea
							name="message"
							placeholder="Ton avis detaille..."
							value={createForm.message}
							onChange={handleCreateInputChange}
							required
						/>
						{createError && <p className="create-review-error">{createError}</p>}
						<button type="submit" disabled={isCreating} className="create-review-btn">
							{isCreating ? "Publication..." : "Poster un avis"}
						</button>
					</form>
				)}

				{actionError && <p className="auth-errors">{actionError}</p>}

				<div className="reviews-container">
					{reviews.length === 0 && !loading && (
						<div className="empty-state">
							<p>Aucun avis pour le moment. Soyez le premier à en laisser un ! 🎮</p>
						</div>
					)}

					{reviews.map((review) => (
						<ReviewCard
							key={review.id}
							review={review}
							isConnected={isConnected}
							canDelete={isConnected && review.author_id === userId}
							onCommentSuccess={handleCommentSuccess}
							onDeleteSuccess={handleDeleteSuccess}
						/>
					))}

					{loading && (
						<div className="loading-state">
							<div className="spinner"></div>
							<p>Chargement des avis...</p>
						</div>
					)}

					{error && (
						<div className="error-state">
							<p>⚠️ {error}</p>
							<button onClick={handleRetry} className="retry-btn">
								Réessayer
							</button>
						</div>
					)}

					{!hasMore && reviews.length > 0 && (
						<div className="end-of-list">
							<p>Vous avez tout vu ! 🎉</p>
						</div>
					)}

					<div ref={observerTarget} className="observer-target" />
				</div>
			</section>
		</main>
	);
}
