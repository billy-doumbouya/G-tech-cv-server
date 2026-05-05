import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import logger from "../utils/logger.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false, { message: "Email Google introuvable" });

        // Cherche un user existant par googleId ou email
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (user) {
          // Mise à jour du googleId si connexion email existante
          if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = profile.photos?.[0]?.value || user.avatar;
            await user.save();
          }
          return done(null, user);
        }

        // Création d'un nouveau compte via Google
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email,
          avatar: profile.photos?.[0]?.value || "",
          isVerified: true, // Google vérifie l'email
          password: Math.random().toString(36).slice(-12) + "Aa1!", // password aléatoire inutilisable
        });

        logger.info(`Nouveau compte Google créé : ${email}`);
        return done(null, user);
      } catch (err) {
        logger.error(`Google OAuth erreur : ${err.message}`);
        return done(err, null);
      }
    }
  )
);

// Pas de serializeUser/deserializeUser car on utilise les sessions manuellement
export default passport;
