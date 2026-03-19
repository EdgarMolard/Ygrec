const API_BASE_URL = "http://localhost:3000/api";

export interface Comment {
  author_id: string;
  author: string;
  message: string;
  date_creation: string;
}

export interface Avis {
  id: string;
  titre: string;
  message: string;
  stars: number;
  nom_jeu: string;
  nombre_heures: number;
  date_creation: string;
  author: string;
  author_id: string;
  likes_count: number;
  comments: Comment[];
}

export interface AvisResponse {
  data: Avis[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function fetchAvis(page: number = 1, limit: number = 10): Promise<AvisResponse> {
  // Inclut le cookie JWT (httpOnly) sur les requetes API pour garder la session active.
  const response = await fetch(
    `${API_BASE_URL}/avis?page=${page}&limit=${limit}`,
    {
      credentials: "include"
    }
  );

  if (!response.ok) {
    // Erreur explicite pour remonter un message lisible dans les composants React.
    throw new Error(`Erreur lors de la récupération des avis: ${response.statusText}`);
  }

  return response.json();
}

export async function likeAvis(avisId: string): Promise<{ message: string; liked: boolean }> {
  // Endpoint toggle: le backend ajoute ou retire le like selon l'etat actuel.
  const response = await fetch(`${API_BASE_URL}/avis/${avisId}/like`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    // Priorise le message serveur pour afficher la cause exacte (auth, validation, etc.).
    throw new Error(data.error ?? "Erreur lors de l'ajout du like");
  }

  return data;
}

export async function commentAvis(avisId: string, contenu: string): Promise<{ message: string; comment: Comment }> {
  // Envoie le contenu en JSON; le cookie de session est inclus automatiquement.
  const response = await fetch(`${API_BASE_URL}/avis/${avisId}/comment`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contenu }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Harmonise la gestion d'erreur cote frontend.
    throw new Error(data.error ?? "Erreur lors de l'ajout du commentaire");
  }

  return data;
}

export interface CreateAvisPayload {
  titre: string;
  message: string;
  stars: number;
  nom_jeu: string;
  nombre_heures: number;
}

export async function createAvis(payload: CreateAvisPayload): Promise<{ message: string; avisId: string }> {
  // Creation d'un avis protegee par session (cookie JWT inclus).
  const response = await fetch(`${API_BASE_URL}/create-avis`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Erreur lors de la creation de l'avis");
  }

  return data;
}

export async function deleteAvis(avisId: string): Promise<{ message: string }> {
  // Suppression d'un avis autorisee uniquement pour son auteur cote backend.
  const response = await fetch(`${API_BASE_URL}/avis/${avisId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Erreur lors de la suppression de l'avis");
  }

  return data;
}
