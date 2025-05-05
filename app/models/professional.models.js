const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: String, required: true },
    contact: { type: Number, required: true },
    country: { type: String, required: true },
    language: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Professional", professionalSchema);
