const asyncHandler = require("express-async-handler");
const Professional = require("../models/professional.models.js");

// GET - Get all professional
const getProfessionals = asyncHandler(async (req, res) => {
  try {
    const pros = await Professional.find();
    res.json(pros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add new professional
const postProfessional = asyncHandler(async (req, res) => {
  try {
    const newPro = new Professional(req.body);
    const saved = await newPro.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Get single professional by ID
const getProfessionalByID = asyncHandler(async (req, res) => {
  try {
    const pro = await Professional.findById(req.params.id);
    if (!pro) return res.status(404).json({ error: "Professional not found" });
    res.json(pro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update professional by ID
const updateProfessional = asyncHandler(async (req, res) => {
  try {
    const updated = await Professional.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Delete professional by ID
const deleteProfessional = asyncHandler(async (req, res) => {
  try {
    const deleted = await Professional.findByIdAndDelete(req.params.id);
    res.json({ message: "Professional deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  getProfessionals,
  postProfessional,
  getProfessionalByID,
  updateProfessional,
  deleteProfessional,
};
