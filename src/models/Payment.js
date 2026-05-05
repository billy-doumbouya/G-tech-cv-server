import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cv:   { type: mongoose.Schema.Types.ObjectId, ref: "CV",   required: true },
    amount:   { type: Number, required: true, default: 50000 },
    currency: { type: String, default: "GNF" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    method: {
      type: String,
      enum: ["orange_money", "mtn_momo", "guinpay"],
      required: true,
    },
    pspReference:      { type: String, default: null },
    pspPayload:        { type: mongoose.Schema.Types.Mixed, default: null },
    webhookReceivedAt: { type: Date, default: null },
    phoneNumber:       { type: String, trim: true, default: "" },
    cvTitle:           { type: String, default: "" },
    confirmedAt:       { type: Date, default: null },
    failedAt:          { type: Date, default: null },
    failureReason:     { type: String, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
