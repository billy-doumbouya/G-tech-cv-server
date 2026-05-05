import PaymentService from "../services/PaymentService.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/Payment.js";
import logger from "../utils/logger.js";

class PaymentController {
  async initiate(req, res) {
    const { cvId, method, phoneNumber } = req.body;
    const result = await PaymentService.initiate({ userId: req.user._id, cvId, method, phoneNumber });
    return ApiResponse.created(res, result, "Paiement initié. Validez sur votre téléphone.");
  }

  async verify(req, res) {
    const result = await PaymentService.verify(req.params.paymentId, req.user._id);
    return ApiResponse.success(res, result);
  }

  async list(req, res) {
    const payments = await PaymentService.listByUser(req.user._id);
    return ApiResponse.success(res, { payments });
  }

  async webhook(req, res) {
    const signature = req.headers["x-guinpay-signature"] || "";
    try {
      await PaymentService.handleWebhook(req.body, signature);
      return res.status(200).json({ received: true });
    } catch (err) {
      logger.error(`Webhook error : ${err.message}`);
      return res.status(400).json({ received: false, error: err.message });
    }
  }

  async adminList(req, res) {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
        .populate("user", "name email").populate("cv", "title"),
      Payment.countDocuments(filter),
    ]);
    return ApiResponse.paginated(res, payments, {
      page: parseInt(page), limit: parseInt(limit), total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  }

  async adminStats(req, res) {
    const stats = await PaymentService.getAdminStats();
    return ApiResponse.success(res, { stats });
  }
}

export default new PaymentController();
