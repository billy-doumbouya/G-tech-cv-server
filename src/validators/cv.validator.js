import { body } from "express-validator";

export const createCVRules = [
  body("title").optional().trim().isLength({ max: 100 }).withMessage("Titre trop long"),
  body("templateId").optional()
    .isIn(["modern-tech", "corporate", "minimal", "creative"]).withMessage("Template invalide"),
];

export const updateCVRules = [
  body("title").optional().trim().isLength({ max: 100 }).withMessage("Titre trop long"),
  body("templateId").optional()
    .isIn(["modern-tech", "corporate", "minimal", "creative"]).withMessage("Template invalide"),
  body("personalInfo.email").optional().isEmail().withMessage("Email invalide").normalizeEmail(),
  body("personalInfo.summary").optional().isLength({ max: 600 }).withMessage("Résumé trop long"),
  body("experiences").optional().isArray().withMessage("Tableau requis"),
  body("skills").optional().isArray().withMessage("Tableau requis"),
  body("skills.*.level").optional().isInt({ min: 0, max: 100 }).withMessage("Entre 0 et 100"),
];
