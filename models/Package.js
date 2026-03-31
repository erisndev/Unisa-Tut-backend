const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    // A stable identifier that can match frontend constants (e.g. "1v1", "1v5")
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Pricing model: price per selected module
    pricePerModule: { type: Number, required: true, min: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
