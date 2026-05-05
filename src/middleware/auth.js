import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  if (!req.session?.userId) {
    return next(ApiError.unauthorized("Veuillez vous connecter"));
  }
  const user = await User.findById(req.session.userId);
  if (!user || !user.isActive) {
    req.session.destroy();
    return next(ApiError.unauthorized("Session invalide ou compte désactivé"));
  }
  req.user = user;
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(ApiError.forbidden("Accès réservé aux administrateurs"));
  }
  next();
};

const ownerOrAdmin = (getOwnerId) => (req, res, next) => {
  const ownerId = getOwnerId(req);
  const isOwner = ownerId?.toString() === req.user._id.toString();
  const isAdmin  = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return next(ApiError.forbidden("Accès non autorisé à cette ressource"));
  }
  next();
};

export { protect, adminOnly, ownerOrAdmin };
