import AuthService from "../services/AuthService.js";
import ApiResponse from "../utils/ApiResponse.js";

class AuthController {
  async register(req, res) {
    const { name, email, password, phone } = req.body;
    const user = await AuthService.register({ name, email, password, phone });
    req.session.userId = user._id.toString();
    return ApiResponse.created(res, { user }, "Compte créé avec succès");
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await AuthService.login({ email, password });
    req.session.userId = user._id.toString();
    req.session.save();
    return ApiResponse.success(res, { user }, "Connexion réussie");
  }

  /**
   * Callback Google OAuth — Passport a déjà authentifié l'utilisateur.
   * req.user est injecté par Passport.
   */
  async googleCallback(req, res) {
    const user = await AuthService.loginWithGoogle(req.user);
    req.session.userId = user._id.toString();
    req.session.save(() => {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    });
  }

  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ success: false, message: "Erreur lors de la déconnexion" });
      res.clearCookie("gtech.sid");
      return res.status(200).json({ success: true, message: "Déconnecté avec succès" });
    });
  }

  async me(req, res) {
    return ApiResponse.success(res, { user: req.user });
  }

  async updateProfile(req, res) {
    const { name, phone, avatar } = req.body;
    const user = await AuthService.updateProfile(req.user._id, { name, phone, avatar });
    return ApiResponse.success(res, { user }, "Profil mis à jour");
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user._id, { currentPassword, newPassword });
    return ApiResponse.success(res, {}, "Mot de passe mis à jour");
  }

  async forgotPassword(req, res) {
    await AuthService.forgotPassword(req.body.email);
    return ApiResponse.success(res, {}, "Si cet email existe, un lien a été envoyé");
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;
    const user = await AuthService.resetPassword(token, password);
    req.session.userId = user._id.toString();
    return ApiResponse.success(res, { user }, "Mot de passe réinitialisé avec succès");
  }
}

export default new AuthController();
