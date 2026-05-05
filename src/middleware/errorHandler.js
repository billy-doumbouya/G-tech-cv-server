import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === "CastError") {
    error = ApiError.notFound(`Ressource avec l'id "${err.value}" introuvable`);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = ApiError.conflict(`La valeur "${value}" pour le champ "${field}" existe déjà`);
  }
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest("Données invalides", errors);
  }

  if (!error.isOperational) {
    logger.error(`[UNHANDLED] ${err.stack}`);
  } else {
    logger.warn(`[API ERROR] ${error.statusCode} — ${error.message}`);
  }

  const statusCode = error.statusCode || 500;
  const message =
    !error.isOperational && process.env.NODE_ENV === "production"
      ? "Erreur serveur interne"
      : error.message;

  return res.status(statusCode).json({
    success: false,
    message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
