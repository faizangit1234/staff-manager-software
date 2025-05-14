// Description: This file contains the controller functions for handling driver-related operations.

const asyncHandler = require("express-async-handler");
const Professional = require("../models/professional.models.js");

// GET all professionals
const getProfessionals = asyncHandler(async (req, res) => {
  const pros = await Professional.find();
  console.log(`[Professional] Fetched ${pros.length} professional(s)`);
  res.status(200).json(pros);
});

// GET professional by ID
const getProfessionalByID = asyncHandler(async (req, res) => {
  const pro = await Professional.findById(req.params.id);
  if (!pro) {
    console.warn(`[Professional] ID not found: ${req.params.id}`);
    return res.status(404).json({ error: "Professional not found" });
  }
  res.status(200).json(pro);
});

// POST new professional
const postProfessional = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    email,
    phone,
    country,
    language,
    address,
    location,
    qualification,
    yearsOfExperience,
    certification,
    skills,
    bio,
    services,
    startTime,
    endTime,
    activeForNightShifts,
    activeDays,
    gender,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !email ||
    !phone ||
    !country ||
    !language ||
    !address ||
    !location ||
    !qualification ||
    !yearsOfExperience ||
    !certification ||
    !skills ||
    !bio ||
    !services ||
    !startTime ||
    !endTime ||
    !gender
  ) {
    console.error(`[Professional] Missing required fields`);
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  if (!req.files?.avatar) {
    return res.status(400).json({
      error: "avatar is required.",
    });
  }

  const proExists = await Professional.findOne({ email });
  if (proExists) {
    return res
      .status(409)
      .json({ error: "Professional with this email already exists" });
  }

  // Parse activeDays safely
  let parsedActiveDays = [];
  try {
    parsedActiveDays =
      typeof activeDays === "string" ? JSON.parse(activeDays) : activeDays;
  } catch (err) {
    console.warn("[Professional] Invalid JSON in activeDays:", err.message);
  }

  // Parse activeDays safely
  let parsedSkills = [];
  try {
    parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills;
  } catch (err) {
    console.warn("[Professional] Invalid JSON in skills:", err.message);
  }

  const avatarPath = req.files?.avatar[0]?.path || null;

  const newPro = new Professional({
    firstName,
    lastName,
    dateOfBirth,
    email,
    phone,
    country,
    language,
    address,
    location,
    qualification,
    yearsOfExperience,
    certification,
    skills: parsedSkills,
    bio,
    services,
    startTime,
    endTime,
    activeForNightShifts,
    activeDays: parsedActiveDays,
    gender,
    avatar: avatarPath,
  });

  const saved = await newPro.save();
  console.log(`[Professional] Created new professional: ${saved._id}`);
  res.status(201).json(saved);
});

// PUT update professional by ID
const updateProfessional = asyncHandler(async (req, res) => {
  const pro = await Professional.findById(req.params.id);
  if (!pro) {
    return res.status(404).json({ error: "Professional not found" });
  }

  Object.assign(pro, req.body);

  if (req.body.activeDays && typeof req.body.activeDays === "string") {
    try {
      pro.activeDays = JSON.parse(req.body.activeDays);
    } catch (err) {
      console.warn("[Professional] Invalid JSON in activeDays:", err.message);
    }
  }
  if (req.body.skills && typeof req.body.skills === "string") {
    try {
      pro.skills = JSON.parse(req.body.skills);
    } catch (err) {
      console.warn("[Professional] Invalid JSON in skills:", err.message);
    }
  }

  if (req.files?.avatar) {
    pro.avatar = req.files.avatar[0].path;
  }

  const updated = await pro.save();
  console.log(`[Professional] Updated professional: ${updated._id}`);
  res.status(200).json(updated);
});

// DELETE professional by ID
const deleteProfessional = asyncHandler(async (req, res) => {
  const deleted = await Professional.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Professional not found" });
  }
  console.log(`[Professional] Deleted professional: ${deleted._id}`);
  res.status(200).json({ message: "Professional deleted", id: deleted._id });
});

module.exports = {
  getProfessionals,
  getProfessionalByID,
  postProfessional,
  updateProfessional,
  deleteProfessional,
};
