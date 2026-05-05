import CV from "../models/CV.js";
import ApiError from "../utils/ApiError.js";

class CVService {
  async listByUser(userId) {
    return CV.find({ user: userId }).sort({ updatedAt: -1 }).select("-__v");
  }

  async getById(cvId, userId, isAdmin = false) {
    const cv = await CV.findById(cvId).populate("user", "name email");
    if (!cv) throw ApiError.notFound("CV introuvable");
    const isOwner = cv.user._id.toString() === userId.toString();
    if (!isOwner && !isAdmin) throw ApiError.forbidden("Accès non autorisé à ce CV");
    return cv;
  }

  async create(userId, data) {
    return CV.create({ user: userId, ...data });
  }

  async update(cvId, userId, data, isAdmin = false) {
    const cv = await CV.findById(cvId);
    if (!cv) throw ApiError.notFound("CV introuvable");
    const isOwner = cv.user.toString() === userId.toString();
    if (!isOwner && !isAdmin) throw ApiError.forbidden("Accès non autorisé");

    delete data.user;
    delete data.status;
    delete data.pdfUrl;

    Object.assign(cv, data);
    await cv.save();
    return cv;
  }

  async remove(cvId, userId, isAdmin = false) {
    const cv = await CV.findById(cvId);
    if (!cv) throw ApiError.notFound("CV introuvable");
    const isOwner = cv.user.toString() === userId.toString();
    if (!isOwner && !isAdmin) throw ApiError.forbidden("Accès non autorisé");
    await cv.deleteOne();
    return true;
  }

  async markAsPaid(cvId, pdfUrl = null) {
    const cv = await CV.findByIdAndUpdate(
      cvId,
      { status: "paid", pdfUrl, pdfGeneratedAt: pdfUrl ? new Date() : null },
      { new: true }
    );
    if (!cv) throw ApiError.notFound("CV introuvable");
    return cv;
  }

  async getAdminStats() {
    const [total, paid, draft] = await Promise.all([
      CV.countDocuments(),
      CV.countDocuments({ status: "paid" }),
      CV.countDocuments({ status: "draft" }),
    ]);
    const byTemplate = await CV.aggregate([
      { $group: { _id: "$templateId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return { total, paid, draft, byTemplate };
  }

  async getDraftCVsForReminder() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return CV.find({
      status: "draft",
      completionScore: { $gte: 40 },
      $or: [
        { paymentReminderSentAt: null },
        { paymentReminderSentAt: { $lt: threeDaysAgo } },
      ],
    }).populate("user", "name email");
  }
}

export default new CVService();
