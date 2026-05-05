import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

dotenv.config();
// On configure les événements UNE SEULE FOIS, à l'import du module
mongoose.connection.on("disconnected", () => {
  logger.warn(
    "⚠️ MongoDB déconnecté — Mongoose tentera de se reconnecter automatiquement.",
  );
});

mongoose.connection.on("error", (err) => {
  logger.error(`❌ Erreur MongoDB : ${err.message}`);
});

const connectDB = async () => {
  try {
    // Vérification de l'URI pour éviter une erreur obscure
    if (!process.env.MONGO_URI) {
      throw new Error("La variable d'environnement MONGO_URI est manquante.");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Garde ce timeout, c'est une bonne pratique
    });

    logger.info(`✅ MongoDB Atlas connecté : ${conn.connection.host}`);
  } catch (err) {
    logger.error(`💥 Échec connexion initiale MongoDB Atlas : ${err.message}`);
    // On quitte le processus car l'app ne peut pas fonctionner sans DB au démarrage
    process.exit(1);
  }
};

export default connectDB;
