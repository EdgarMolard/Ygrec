import "dotenv/config";
import cors from "cors";
import express from "express";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

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
    const result = await pool.query("SELECT id, password FROM utilisateur WHERE pseudo = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }
    res.json({ message: "Connexion réussie", userId: user.id });
    //on veut renvoyer un token d'authentification dans un header pour qu'ensuite le frontend mémorise 
    // ce token dans le localStorage et le renvoie dans les headers des requêtes suivantes pour prouver
    // que l'utilisateur est connecté
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue lors de la connexion à la base de données";
    res.status(500).json({ error: "Erreur de base de données", message });
  }
});
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});