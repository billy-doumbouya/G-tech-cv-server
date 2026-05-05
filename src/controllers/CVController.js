import CVService from "../services/CVService.js";
import PdfService from "../services/PdfService.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import CV from "../models/CV.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

class CVController {
  async list(req, res) {
    const cvs = await CVService.listByUser(req.user._id);
    return ApiResponse.success(res, { cvs });
  }

  async getOne(req, res) {
    const cv = await CVService.getById(req.params.id, req.user._id, req.user.role === "admin");
    return ApiResponse.success(res, { cv });
  }

  async create(req, res) {
    const cv = await CVService.create(req.user._id, req.body);
    return ApiResponse.created(res, { cv }, "CV créé avec succès");
  }

  async update(req, res) {
    const cv = await CVService.update(req.params.id, req.user._id, req.body, req.user.role === "admin");
    return ApiResponse.success(res, { cv }, "CV mis à jour");
  }

  async remove(req, res) {
    await CVService.remove(req.params.id, req.user._id, req.user.role === "admin");
    return ApiResponse.noContent(res);
  }

  async download(req, res) {
    const cv = await CVService.getById(req.params.id, req.user._id);
    if (cv.status !== "paid") throw ApiError.forbidden("Ce CV doit être payé avant d'être téléchargé");

    if (!cv.pdfUrl) {
      const pdfPath = await PdfService.generateCVPdf(cv);
      cv.pdfUrl = pdfPath;
      cv.pdfGeneratedAt = new Date();
      await cv.save();
    }

    const absolutePath = path.join(__dirname, "../../", cv.pdfUrl);
    if (!fs.existsSync(absolutePath)) {
      const pdfPath = await PdfService.generateCVPdf(cv);
      cv.pdfUrl = pdfPath;
      await cv.save();
    }

    const fileName = `${cv.title.replace(/\s+/g, "_")}_CV.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");
    return res.sendFile(path.join(__dirname, "../../", cv.pdfUrl));
  }

  async adminList(req, res) {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cvs, total] = await Promise.all([
      CV.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit)).populate("user", "name email"),
      CV.countDocuments(filter),
    ]);
    return ApiResponse.paginated(res, cvs, {
      page: parseInt(page), limit: parseInt(limit), total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  }

  async adminStats(req, res) {
    const stats = await CVService.getAdminStats();
    return ApiResponse.success(res, { stats });
  }
}

export default new CVController();
