import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Avis, likeAvis, commentAvis, deleteAvis, deleteCommentAvis } from "../services/AvisService";
import "../styles/ReviewCard.css";

interface ReviewCardProps {
  review: Avis;
  isConnected: boolean;
  currentUserId?: string;
  currentUserIsAdmin?: boolean;
  canDelete?: boolean;
  onLikeSuccess?: () => void;
  onCommentSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export default function ReviewCard({
  review,
  isConnected,
  currentUserId,
  currentUserIsAdmin = false,
  canDelete = false,
  onLikeSuccess,
  onCommentSuccess,
  onDeleteSuccess,
}: ReviewCardProps) {
  // Etats locaux pour refléter immédiatement les actions utilisateur dans l'UI.
  const [likes, setLikes] = useState<number>(review.likes_count);
  const [isLiked, setIsLiked] = useState<boolean>(Boolean(review.liked_by_current_user));
  const [showCommentForm, setShowCommentForm] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [isLoadingLike, setIsLoadingLike] = useState<boolean>(false);
  const [isLoadingComment, setIsLoadingComment] = useState<boolean>(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLikes(review.likes_count);
  }, [review.likes_count]);

  useEffect(() => {
    setIsLiked(Boolean(review.liked_by_current_user));
  }, [review.liked_by_current_user]);

  const handleLike = async () => {
    // Garde: un like est autorisé uniquement si l'utilisateur est connecté.
    if (!isConnected) {
      setError("Veuillez vous connecter pour aimer cet avis");
      return;
    }

    setIsLoadingLike(true);
    setError(null);

    try {
      const result = await likeAvis(review.id);
      // L'API est un toggle: on incremente si like ajoute, sinon on retire un like.
      setIsLiked(result.liked);
      setLikes((prev: number) => (result.liked ? prev + 1 : Math.max(prev - 1, 0)));
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

  const handleDeleteComment = async (commentId: string) => {
    const isConfirmed = window.confirm("Confirmer la suppression de ce commentaire ?");
    if (!isConfirmed) {
      return;
    }

    setDeletingCommentId(commentId);
    setError(null);

    try {
      await deleteCommentAvis(review.id, commentId);
      onCommentSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression du commentaire";
      setError(message);
    } finally {
      setDeletingCommentId(null);
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
      // Format d'affichage homogene en francais sur tout le feed (date + heure).
      return new Date(dateString).toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
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
          className={`action-btn like-btn ${isLiked ? "liked" : ""}`.trim()}
          onClick={handleLike}
          disabled={isLoadingLike || !isConnected}
          aria-pressed={isLiked}
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
            {review.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <strong className="comment-author">{comment.author}</strong>
                  <div className="comment-header-right">
                    <span className="comment-date">{formatDate(comment.date_creation)}</span>
                    {isConnected && (currentUserIsAdmin || (currentUserId && comment.author_id === currentUserId)) && (
                      <button
                        type="button"
                        className="comment-delete-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                      >
                        {deletingCommentId === comment.id ? "Suppression..." : "Supprimer"}
                      </button>
                    )}
                  </div>
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
