import crypto from "crypto";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import EmailService from "./EmailService.js";
import logger from "../utils/logger.js";

class AuthService {
  async register({ name, email, password, phone }) {
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict("Un compte avec cet email existe déjà");

    const user = await User.create({ name, email, password, phone });

    EmailService.sendWelcome({ to: user.email, name: user.name }).catch((err) =>
      logger.warn(`Welcome email non envoyé : ${err.message}`)
    );

    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw ApiError.unauthorized("Email ou mot de passe incorrect");
    if (!user.isActive) throw ApiError.forbidden("Votre compte a été désactivé");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized("Email ou mot de passe incorrect");

    return user;
  }

  /**
   * Appelé après succès Google OAuth.
   * Le user est déjà créé/récupéré par Passport.
   */
  async loginWithGoogle(googleUser) {
    if (!googleUser) throw ApiError.unauthorized("Authentification Google échouée");
    if (!googleUser.isActive) throw ApiError.forbidden("Compte désactivé");
    return googleUser;
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("Utilisateur introuvable");
    return user;
  }

  async updateProfile(userId, { name, phone, avatar }) {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    if (!user) throw ApiError.notFound("Utilisateur introuvable");
    return user;
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw ApiError.notFound("Utilisateur introuvable");

    // Les comptes Google n'ont pas de vrai mot de passe
    if (user.googleId && !user.password) {
      throw ApiError.badRequest("Compte Google — définissez d'abord un mot de passe");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw ApiError.badRequest("Mot de passe actuel incorrect");

    user.password = newPassword;
    await user.save();
    return true;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Reset password pour email inconnu : ${email}`);
      return true; // réponse générique anti-énumération
    }

    if (user.googleId && !user.password) {
      throw ApiError.badRequest("Ce compte utilise Google. Connectez-vous via Google.");
    }

    const rawToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    try {
      await EmailService.sendResetPassword({ to: user.email, name: user.name, resetUrl });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw ApiError.internal("Erreur lors de l'envoi de l'email.");
    }

    return true;
  }

  async resetPassword(rawToken, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) throw ApiError.badRequest("Token invalide ou expiré");

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
  }
}

export default new AuthService();
