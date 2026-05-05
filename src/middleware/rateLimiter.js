import rateLimit from "express-rate-limit";

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: options.message || "Trop de requêtes, réessayez plus tard.",
      });
    },
    ...options,
  });

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
});

export const resetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Trop de demandes de réinitialisation. Réessayez dans 1 heure.",
});

export const globalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: "Limite de requêtes atteinte.",
});

export const paymentLimiter = createLimiter({
  windowMs: 30 * 60 * 1000,
  max: 15,
  message: "Trop de tentatives de paiement.",
});

export const pdfLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Limite de génération PDF atteinte.",
});
