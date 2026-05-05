import { body } from "express-validator";

export const initiatePaymentRules = [
  body("cvId").notEmpty().withMessage("ID du CV requis").isMongoId().withMessage("ID invalide"),
  body("method").notEmpty().withMessage("Méthode de paiement requise")
    .isIn(["orange_money", "mtn_momo", "guinpay"]).withMessage("Méthode non supportée"),
  body("phoneNumber").notEmpty().withMessage("Numéro de téléphone requis")
    .matches(/^(\+224|00224|224)?[0-9]{8,9}$/).withMessage("Numéro guinéen invalide"),
];
