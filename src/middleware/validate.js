import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((err) => ({ field: err.path, message: err.msg }));
  return next(ApiError.badRequest("Données invalides", errors));
};

export default validate;
