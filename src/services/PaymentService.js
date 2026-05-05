import axios from "axios";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import CV from "../models/CV.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import PdfService from "./PdfService.js";
import EmailService from "./EmailService.js";

class PaymentService {
  constructor() {
    this.guinpay = axios.create({
      baseURL: process.env.GUINPAY_API_URL,
      headers: {
        Authorization: `Bearer ${process.env.GUINPAY_API_KEY}`,
        "Content-Type": "application/json",
        "X-Merchant-ID": process.env.GUINPAY_MERCHANT_ID,
      },
      timeout: 15000,
    });
  }

  async initiate({ userId, cvId, method, phoneNumber }) {
    const cv = await CV.findOne({ _id: cvId, user: userId });
    if (!cv) throw ApiError.notFound("CV introuvable");
    if (cv.status === "paid") throw ApiError.conflict("Ce CV est déjà payé");

    const amount = parseInt(process.env.CV_PRICE_GNF) || 50000;

    const payment = await Payment.create({
      user: userId, cv: cvId, amount, method, phoneNumber, cvTitle: cv.title,
    });

    let pspResponse;
    try {
      const { data } = await this.guinpay.post("/payments/initiate", {
        merchant_id: process.env.GUINPAY_MERCHANT_ID,
        amount, currency: "GNF",
        payment_method: this._mapMethod(method),
        phone_number: phoneNumber,
        order_id: payment._id.toString(),
        callback_url: `${process.env.FRONTEND_URL}/success?paymentId=${payment._id}`,
        webhook_url: `${process.env.CLIENT_URL}/api/payments/webhook`,
        description: `G-Tech CV — ${cv.title}`,
      });
      pspResponse = data;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        logger.warn("GuinPay indisponible — simulation DEV");
        pspResponse = { transaction_id: `mock_${Date.now()}`, status: "pending", payment_url: null };
      } else {
        await payment.deleteOne();
        throw ApiError.internal("Erreur lors de l'initiation du paiement.");
      }
    }

    payment.pspReference = pspResponse.transaction_id;
    payment.pspPayload = pspResponse;
    await payment.save();

    return {
      paymentId: payment._id,
      pspReference: pspResponse.transaction_id,
      paymentUrl: pspResponse.payment_url || null,
      status: "pending",
      amount,
      message: "Validez le paiement sur votre téléphone",
    };
  }

  async verify(paymentId, userId) {
    const payment = await Payment.findOne({ _id: paymentId, user: userId });
    if (!payment) throw ApiError.notFound("Paiement introuvable");

    if (["confirmed", "failed"].includes(payment.status)) {
      return { status: payment.status, payment };
    }

    try {
      const { data } = await this.guinpay.get(`/payments/${payment.pspReference}/status`);
      if (data.status === "success" || data.status === "confirmed") {
        await this._confirmPayment(payment);
        return { status: "confirmed", payment };
      }
      if (data.status === "failed" || data.status === "cancelled") {
        await this._failPayment(payment, data.reason || "Refusé");
        return { status: "failed", payment };
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        logger.warn("GuinPay verify indisponible — simulation DEV");
        await this._confirmPayment(payment);
        return { status: "confirmed", payment };
      }
    }

    return { status: "pending", payment };
  }

  async handleWebhook(payload, signature) {
    const expected = crypto
      .createHmac("sha256", process.env.GUINPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (signature !== expected) throw ApiError.forbidden("Signature webhook invalide");

    const payment = await Payment.findOne({ pspReference: payload.transaction_id });
    if (!payment) return false;

    payment.webhookReceivedAt = new Date();
    if (payload.status === "success" || payload.status === "confirmed") {
      await this._confirmPayment(payment);
    } else if (payload.status === "failed") {
      await this._failPayment(payment, payload.reason);
    }
    return true;
  }

  async listByUser(userId) {
    return Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("cv", "title templateId");
  }

  async getAdminStats() {
    const [total, confirmed, pending, failed] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: "confirmed" }),
      Payment.countDocuments({ status: "pending" }),
      Payment.countDocuments({ status: "failed" }),
    ]);
    const revenue = await Payment.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const recentPayments = await Payment.find({ status: "confirmed" })
      .sort({ confirmedAt: -1 }).limit(10)
      .populate("user", "name email").populate("cv", "title");

    return { total, confirmed, pending, failed, revenue: revenue[0]?.total || 0, recentPayments };
  }

  async _confirmPayment(payment) {
    if (payment.status === "confirmed") return;
    payment.status = "confirmed";
    payment.confirmedAt = new Date();
    await payment.save();

    const cv = await CV.findByIdAndUpdate(payment.cv, { status: "paid" }, { new: true })
      .populate("user", "name email");
    if (!cv) return;

    try {
      const pdfPath = await PdfService.generateCVPdf(cv);
      cv.pdfUrl = pdfPath;
      cv.pdfGeneratedAt = new Date();
      await cv.save();

      EmailService.sendCVGenerated({
        to: cv.user.email,
        name: cv.user.name,
        cvTitle: cv.title,
        downloadUrl: `${process.env.FRONTEND_URL}/dashboard`,
      }).catch((err) => logger.warn(`Email CV non envoyé : ${err.message}`));
    } catch (err) {
      logger.error(`Erreur PDF après paiement : ${err.message}`);
    }
  }

  async _failPayment(payment, reason = "Échec") {
    payment.status = "failed";
    payment.failedAt = new Date();
    payment.failureReason = reason;
    await payment.save();
  }

  _mapMethod(method) {
    return { orange_money: "ORANGE_MONEY_GN", mtn_momo: "MTN_MOMO_GN", guinpay: "GUINPAY" }[method] || method;
  }
}

export default new PaymentService();
