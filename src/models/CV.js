import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  company:     { type: String, trim: true },
  position:    { type: String, trim: true },
  startDate:   { type: String, trim: true },
  endDate:     { type: String, trim: true },
  current:     { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: 800 },
});

const educationSchema = new mongoose.Schema({
  school:  { type: String, trim: true },
  degree:  { type: String, trim: true },
  year:    { type: String, trim: true },
  mention: { type: String, trim: true },
});

const skillSchema = new mongoose.Schema({
  name:  { type: String, trim: true },
  level: { type: Number, min: 0, max: 100, default: 70 },
});

const languageSchema = new mongoose.Schema({
  name:  { type: String, trim: true },
  level: {
    type: String,
    enum: ["Natif", "Courant", "Avancé", "Intermédiaire", "Débutant"],
    default: "Intermédiaire",
  },
});

const cvSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [100, "Titre trop long"],
      default: "Mon CV",
    },
    templateId: {
      type: String,
      enum: ["modern-tech", "corporate", "minimal", "creative"],
      default: "modern-tech",
    },
    status: {
      type: String,
      enum: ["draft", "paid"],
      default: "draft",
    },
    personalInfo: {
      firstName: { type: String, trim: true, default: "" },
      lastName:  { type: String, trim: true, default: "" },
      jobTitle:  { type: String, trim: true, default: "" },
      email:     { type: String, trim: true, default: "" },
      phone:     { type: String, trim: true, default: "" },
      location:  { type: String, trim: true, default: "" },
      linkedin:  { type: String, trim: true, default: "" },
      summary:   { type: String, trim: true, maxlength: 600, default: "" },
    },
    experiences:  [experienceSchema],
    education:    [educationSchema],
    skills:       [skillSchema],
    languages:    [languageSchema],
    pdfUrl:       { type: String, default: null },
    pdfGeneratedAt: { type: Date, default: null },
    paymentReminderSentAt:    { type: Date, default: null },
    completionReminderSentAt: { type: Date, default: null },
    completionScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

cvSchema.virtual("fullName").get(function () {
  const { firstName, lastName } = this.personalInfo || {};
  return `${firstName || ""} ${lastName || ""}`.trim();
});

cvSchema.pre("save", function (next) {
  let score = 0;
  const p = this.personalInfo || {};
  if (p.firstName && p.lastName) score += 15;
  if (p.jobTitle) score += 10;
  if (p.email) score += 10;
  if (p.phone) score += 5;
  if (p.location) score += 5;
  if (p.summary && p.summary.length > 30) score += 15;
  if (this.experiences?.length > 0) score += 20;
  if (this.education?.length > 0) score += 10;
  if (this.skills?.length >= 3) score += 5;
  if (this.languages?.length >= 1) score += 5;
  this.completionScore = Math.min(score, 100);
  next();
});

const CV = mongoose.model("CV", cvSchema);
export default CV;
