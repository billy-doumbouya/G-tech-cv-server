import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import CVService from "../services/CVService.js";
import PaymentService from "../services/PaymentService.js";

class AdminController {
  async getStats(req, res) {
    const [totalUsers, cvStats, paymentStats, newUsersThisWeek] = await Promise.all([
      User.countDocuments(),
      CVService.getAdminStats(),
      PaymentService.getAdminStats(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const userGrowthRaw = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const planDist = await User.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]);
    const planMap  = { free: 0, premium: 0, enterprise: 0 };
    planDist.forEach((p) => { if (planMap[p._id] !== undefined) planMap[p._id] = p.count; });
    const planTotal = Object.values(planMap).reduce((a, b) => a + b, 0) || 1;

    return ApiResponse.success(res, {
      totalUsers,
      totalCVs: cvStats.total,
      paidCVs: cvStats.paid,
      revenue: paymentStats.revenue,
      pendingPayments: paymentStats.pending,
      newUsersThisWeek,
      userGrowth: userGrowthRaw.map((u) => u.count),
      planDistribution: {
        free: Math.round((planMap.free / planTotal) * 100),
        premium: Math.round((planMap.premium / planTotal) * 100),
        enterprise: Math.round((planMap.enterprise / planTotal) * 100),
      },
    });
  }

  async getUsers(req, res) {
    const { page = 1, limit = 20, search, role, plan } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    if (role) filter.role = role;
    if (plan) filter.plan = plan;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    return ApiResponse.paginated(res, users, {
      page: parseInt(page), limit: parseInt(limit), total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  }

  async updateUser(req, res) {
    const { role, plan, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, plan, isActive }, { new: true, runValidators: true });
    if (!user) throw ApiError.notFound("Utilisateur introuvable");
    return ApiResponse.success(res, { user }, "Utilisateur mis à jour");
  }

  async deleteUser(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) throw ApiError.notFound("Utilisateur introuvable");
    if (user._id.toString() === req.user._id.toString()) throw ApiError.badRequest("Impossible de supprimer votre propre compte");
    await user.deleteOne();
    return ApiResponse.noContent(res);
  }
}

export default new AdminController();
