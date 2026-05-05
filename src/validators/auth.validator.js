import { body } from "express-validator";

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Le nom est requis")
    .isLength({ min: 2, max: 80 }).withMessage("Entre 2 et 80 caractères"),
  body("email").trim().notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage("Email invalide").normalizeEmail(),
  body("password").notEmpty().withMessage("Le mot de passe est requis")
    .isLength({ min: 6 }).withMessage("Minimum 6 caractères"),
  body("phone").optional().trim().isMobilePhone().withMessage("Téléphone invalide"),
];

export const loginRules = [
  body("email").trim().notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage("Email invalide").normalizeEmail(),
  body("password").notEmpty().withMessage("Le mot de passe est requis"),
];

export const forgotPasswordRules = [
  body("email").trim().notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage("Email invalide").normalizeEmail(),
];

export const resetPasswordRules = [
  body("password").notEmpty().withMessage("Requis").isLength({ min: 6 }).withMessage("Minimum 6 caractères"),
  body("confirm").notEmpty().withMessage("La confirmation est requise")
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Les mots de passe ne correspondent pas");
      return true;
    }),
];
