import { useState, FormEvent, ChangeEvent } from "react";
import { Avis, likeAvis, commentAvis, deleteAvis } from "../services/AvisService";
import "../styles/ReviewCard.css";

interface ReviewCardProps {
  review: Avis;
  isConnected: boolean;
  canDelete?: boolean;
  onLikeSuccess?: () => void;
  onCommentSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export default function ReviewCard({
  review,
  isConnected,
  canDelete = false,
  onLikeSuccess,
  onCommentSuccess,
  onDeleteSuccess,
}: ReviewCardProps) {
  // Etats locaux pour refléter immédiatement les actions utilisateur dans l'UI.
  const [likes, setLikes] = useState<number>(review.likes_count);
  const [showCommentForm, setShowCommentForm] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [isLoadingLike, setIsLoadingLike] = useState<boolean>(false);
  const [isLoadingComment, setIsLoadingComment] = useState<boolean>(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    // Garde: un like est autorisé uniquement si l'utilisateur est connecté.
    if (!isConnected) {
      setError("Veuillez vous connecter pour aimer cet avis");
      return;
    }

    setIsLoadingLike(true);
    setError(null);

    try {
      await likeAvis(review.id);
      // Mise a jour fonctionnelle pour eviter les valeurs obsoletes en asynchrone.
      setLikes((prev: number) => prev + 1);
      onLikeSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'ajout du like";
      setError(message);
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Evite le rechargement de page provoque par la soumission native du formulaire.
    e.preventDefault();

    if (!isConnected) {
      setError("Veuillez vous connecter pour commenter cet avis");
      return;
    }

    if (!commentText.trim()) {
      setError("Le commentaire ne peut pas être vide");
      return;
    }

    setIsLoadingComment(true);
    setError(null);

    try {
      await commentAvis(review.id, commentText);
      // Reinitialise le formulaire et laisse le parent relancer un rafraichissement si besoin.
      setCommentText("");
      setShowCommentForm(false);
      onCommentSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'ajout du commentaire";
      setError(message);
    } finally {
      setIsLoadingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }

    const isConfirmed = window.confirm("Confirmer la suppression de cet avis ?");
    if (!isConfirmed) {
      return;
    }

    setIsLoadingDelete(true);
    setError(null);

    try {
      await deleteAvis(review.id);
      onDeleteSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression de l'avis";
      setError(message);
    } finally {
      setIsLoadingDelete(false);
    }
  };

  const renderStars = (stars: number) => {
    // Affiche toujours 5 etoiles, remplies selon la note numerique.
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < stars ? "star filled" : "star empty"}>
        ★
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    try {
      // Format d'affichage homogene en francais sur tout le feed.
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      // Fallback: conserve la valeur brute si le parsing echoue.
      return dateString;
    }
  };

  return (
    <article className="review-card">
      <div className="review-header">
        <div className="review-game-info">
          <h3 className="review-game">{review.nom_jeu}</h3>
          <p className="review-hours">{review.nombre_heures}h jouées</p>
        </div>
        <div className="review-rating">{renderStars(review.stars)}</div>
      </div>

      <div className="review-content">
        <h4 className="review-title">{review.titre}</h4>
        <p className="review-author">par {review.author}</p>
        <p className="review-date">{formatDate(review.date_creation)}</p>
        <p className="review-message">{review.message}</p>
      </div>

      <div className="review-actions">
        <button
          className="action-btn like-btn"
          onClick={handleLike}
          disabled={isLoadingLike || !isConnected}
          title={!isConnected ? "Connectez-vous pour aimer" : "Aimer cet avis"}
        >
          ❤️ {likes}
        </button>
        <button
          className="action-btn comment-btn"
          onClick={() => setShowCommentForm(!showCommentForm)}
          disabled={!isConnected}
          title={!isConnected ? "Connectez-vous pour commenter" : "Commenter"}
        >
          💬 {review.comments.length}
        </button>
        {canDelete && (
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            disabled={isLoadingDelete}
            title="Supprimer cet avis"
          >
            {isLoadingDelete ? "Suppression..." : "🗑️ Supprimer"}
          </button>
        )}
      </div>

      {error && <div className="review-error">{error}</div>}

      {showCommentForm && isConnected && (
        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <textarea
            value={commentText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
            placeholder="Écrivez votre commentaire..."
            className="comment-input"
            rows={3}
          />
          <div className="comment-form-actions">
            <button type="submit" className="submit-btn" disabled={isLoadingComment}>
              {isLoadingComment ? "Envoi..." : "Envoyer"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setShowCommentForm(false);
                setCommentText("");
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {review.comments.length > 0 && (
        <div className="comments-section">
          <h5 className="comments-title">Commentaires ({review.comments.length})</h5>
          <div className="comments-list">
            {review.comments.map((comment, index) => (
              <div key={index} className="comment-item">
                <div className="comment-header">
                  <strong className="comment-author">{comment.author}</strong>
                  <span className="comment-date">{formatDate(comment.date_creation)}</span>
                </div>
                <p className="comment-text">{comment.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
