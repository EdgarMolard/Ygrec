import "dotenv/config";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";


const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Middleware d'authentification avec token JWT du cookie
interface AuthRequest extends Request {
  userId?: string;
}

const verifyAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Le token JWT est lu depuis le cookie httpOnly defini a la connexion.
  const token = req.cookies?.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: "Token manquant. Veuillez vous connecter." });
  }

  try {
    // Si le token est valide, on injecte userId dans la requete pour les routes protegees.
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "secret") as JwtPayload;
    if (typeof decoded.userId !== "string") {
      return res.status(403).json({ error: "Token invalide ou expiré", message: "userId JWT invalide" });
    }
    req.userId = decoded.userId;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Token invalide";
    return res.status(403).json({ error: "Token invalide ou expiré", message });
  }
};

const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number.parseInt(process.env.DB_PORT ?? "5432", 10),
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_NAME ?? "notationjv"
});

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    res.status(500).json({ status: "error", db: "disconnected", message });
  }
});

app.get("/api/ping", (_req, res) => {
  res.json({
    message: "Pong depuis Express TypeScript",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/create-user", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  try {
    const existingNickname = await pool.query("SELECT id FROM utilisateur WHERE pseudo = $1", [username]);
    const existingEmail = await pool.query("SELECT id FROM utilisateur WHERE email = $1", [email]);
    if (existingNickname.rows.length > 0 ) {
      return res.status(409).json({ error: "Le nom d'utilisateur est déjà utilisé","code": "USERNAME_ALREADY_USED" });
    }
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ error: "L'email est déjà utilisé","code": "EMAIL_ALREADY_USED"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query("INSERT INTO utilisateur (id, pseudo, email, password, is_admin) VALUES (gen_random_uuid(), $1, $2, $3, false) RETURNING id", [username, email, hashedPassword]);
    res.status(201).json({ message: "Utilisateur créé", userId: result.rows[0].id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue lors de la création de l'utilisateur au niveau de la base de données";
    res.status(500).json({ error: "Erreure de base de données", message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  try {
    const result = await pool.query("SELECT id, pseudo, password FROM utilisateur WHERE pseudo = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET ?? "secret",
      { expiresIn: "1h" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000
    });

    res.status(200).json({ message: "Connexion réussie", userId: user.id, username: user.pseudo });
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue lors de la connexion à la base de données";
    res.status(500).json({ error: "Erreur de base de données", message });
  }
});

app.post("/api/logout", (_req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  res.status(200).json({ message: "Déconnexion réussie" });
});

app.get("/api/avis", async (req, res) => {
  try {
    // Pagination simple: page/limit/offset pour supporter le lazy loading du frontend.
    const page = Number.parseInt(req.query.page as string ?? "1", 10);
    const limit = Number.parseInt(req.query.limit as string ?? "10", 10);
    const offset = (page - 1) * limit;

    // Récupérer les avis avec les informations utilisateur
    const avisResult = await pool.query(
      `SELECT 
        a.id_avis as id, 
        a.titre, 
        a.message, 
        a.stars, 
        a.nom_jeu, 
        a.nombre_heures,
        a.date_creation,
        u.pseudo as author,
        u.id as author_id,
        COUNT(DISTINCT j.id)::int as likes_count
      FROM avis a
      LEFT JOIN utilisateur u ON a.id = u.id
      LEFT JOIN jaime j ON a.id_avis = j.id_avis
      GROUP BY a.id_avis, u.id
      ORDER BY a.date_creation DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Récupérer le nombre total pour la pagination
    const countResult = await pool.query("SELECT COUNT(*) FROM avis");
    const total = parseInt(countResult.rows[0].count, 10);

    // Pour chaque avis, récupérer les commentaires
    const avisWithComments = await Promise.all(
      avisResult.rows.map(async (avis) => {
        // Associe les commentaires a chaque avis pour eviter un second appel API cote client.
        const commentsResult = await pool.query(
          `SELECT 
            c.id as author_id,
            u.pseudo as author,
            c.message,
            c.date_com as date_creation
          FROM commente c
          LEFT JOIN utilisateur u ON c.id = u.id
          WHERE c.id_avis = $1
          ORDER BY c.date_com ASC`,
          [avis.id]
        );
        return {
          ...avis,
          comments: commentsResult.rows
        };
      })
    );

    res.status(200).json({
      data: avisWithComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue lors de la récupération des avis depuis la base de données";
    res.status(500).json({ error: "Erreur de base de données", message });
  }
});

// Ajouter un like à un avis
app.post("/api/avis/:id/like", verifyAuth, async (req: AuthRequest, res) => {
  try {
    // userId vient du middleware verifyAuth; l'action est impossible sans session valide.
    const userId = req.userId;
    const avisId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "userId invalide" });
    }

    // Vérifier si le like existe déjà
    const existingLike = await pool.query(
      "SELECT id FROM jaime WHERE id_avis = $1 AND id = $2",
      [avisId, userId]
    );

    if (existingLike.rows.length > 0) {
      // Retirer le like
      await pool.query(
        "DELETE FROM jaime WHERE id_avis = $1 AND id = $2",
        [avisId, userId]
      );
      res.status(200).json({ message: "Like supprimé", liked: false });
    } else {
      // Ajouter le like
      await pool.query(
        "INSERT INTO jaime (id, id_avis, date_like) VALUES ($1, $2, NOW())",
        [userId, avisId]
      );
      res.status(201).json({ message: "Like ajouté", liked: true });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({ error: "Erreur de base de données", message });
  }
});

// Ajouter un commentaire à un avis
app.post("/api/avis/:id/comment", verifyAuth, async (req: AuthRequest, res) => {
  try {
    // Le commentaire est rattache a l'utilisateur authentifie et horodate cote serveur.
    const userId = req.userId;
    const avisId = req.params.id;
    const { contenu } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId invalide" });
    }

    if (!contenu || !String(contenu).trim()) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const result = await pool.query(
      `INSERT INTO commente (id, id_avis, id_com, message, date_com) 
       VALUES ($1, $2, gen_random_uuid(), $3, NOW()) 
       RETURNING id as author_id, id_avis, message, date_com as date_creation`,
      [userId, avisId, contenu]
    );

    res.status(201).json({ message: "Commentaire ajouté", comment: result.rows[0] });
  } catch (error: unknown) {
    // Log detaille pour diagnostiquer les erreurs SQL reelles lors de l'ajout d'un commentaire.
    console.error("[POST /api/avis/:id/comment] Erreur DB", {
      avisId: req.params.id,
      userId: req.userId,
      body: req.body,
      error,
    });

    const message = error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({ error: "Erreur de base de données", message });
  }
});

app.post("/api/create-avis", verifyAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { titre, message, stars, nom_jeu, nombre_heures } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId invalide" });
    }
    if (!titre || !message || stars === undefined || !nom_jeu || nombre_heures === undefined) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const starsNumber = Number(stars);
    const hoursNumber = Number(nombre_heures);

    if (!Number.isFinite(starsNumber) || starsNumber < 0 || starsNumber > 5) {
      return res.status(400).json({ error: "La note doit etre comprise entre 0 et 5" });
    }

    if (!Number.isInteger(hoursNumber) || hoursNumber < 0) {
      return res.status(400).json({ error: "Le nombre d'heures doit etre un entier positif" });
    }

    const result = await pool.query(
      `INSERT INTO avis (id_avis, id, titre, message, stars, nom_jeu, nombre_heures, date_creation) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id_avis as id`,
      [userId, titre, message, starsNumber, nom_jeu, hoursNumber]
    );
    res.status(201).json({ message: "Avis créé", avisId: result.rows[0].id });
  }
   catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({ error: "Erreur de base de données", message });
  }
});

app.delete("/api/avis/:id", verifyAuth, async (req: AuthRequest, res) => {
  const client = await pool.connect();

  try {
    const userId = req.userId;
    const avisId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "userId invalide" });
    }

    await client.query("BEGIN");

    // Verification de propriete: seul l'auteur peut supprimer son avis.
    const ownerResult = await client.query(
      "SELECT id FROM avis WHERE id_avis = $1",
      [avisId]
    );

    if (ownerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Avis introuvable" });
    }

    if (ownerResult.rows[0].id !== userId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres avis" });
    }

    // Suppression des dependances pour respecter les contraintes de cle etrangere.
    await client.query("DELETE FROM jaime WHERE id_avis = $1", [avisId]);
    await client.query("DELETE FROM commente WHERE id_avis = $1", [avisId]);
    await client.query("DELETE FROM avis WHERE id_avis = $1", [avisId]);

    await client.query("COMMIT");
    res.status(200).json({ message: "Avis supprimé" });
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    res.status(500).json({ error: "Erreur de base de données", message });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});