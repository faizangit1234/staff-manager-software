// Description: This file contains the controller functions for handling driver-related operations.
const asyncHandler = require("express-async-handler");
const Driver = require("../models/driver.models.js");
const Schedule = require("../models/Schedule.models.js");

// GET all drivers
const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find().sort({ createdAt: -1 });
  console.log(`[Driver] Fetched ${drivers.length} driver(s)`);
  res.status(200).json(drivers);
});

// GET driver by ID
const getDriverByID = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    console.warn(`[Driver] ID not found: ${req.params.id}`);
    return res.status(404).json({ error: "Driver not found" });
  }
  const schedules = await Schedule.find({ driver: driver._id })
    .populate("professional", "firstName lastName services")
    .sort({ date: 1 });

  res.status(200).json({ ...driver.toObject(), schedules });
});

// POST new driver
const postDriver = asyncHandler(async (req, res) => {
  try {
    console.log("[Driver] Incoming request body:", req.body);
    console.log("[Driver] Incoming files:", req.files);

    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      phoneNo,
      country,
      baseLocation,
      vehicleCapacity,
      startTime,
      endTime,
      breakStartTime,
      breakEndTime,
      priority,
      activeDays,
      gender,
      languages,
    } = req.body;

    // Check required fields
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !email ||
      !phoneNo ||
      !country ||
      !baseLocation ||
      !vehicleCapacity ||
      !startTime ||
      !endTime ||
      !breakStartTime ||
      !breakEndTime ||
      !priority ||
      !gender ||
      !languages
    ) {
      console.error("[Driver] Missing required fields");
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    if (!req.files?.photos || !req.files?.avatar) {
      return res.status(400).json({
        error: "Photos and avatar are required.",
      });
    }

    const driverExists = await Driver.findOne({ email });
    if (driverExists) {
      return res
        .status(409)
        .json({ error: "Driver with this email already exists." });
    }

    // Parse activeDays safely
    let parsedActiveDays = [];
    try {
      parsedActiveDays =
        typeof activeDays === "string" ? JSON.parse(activeDays) : activeDays;
    } catch (err) {
      console.warn("[Driver] Invalid JSON in activeDays:", err.message);
    }

    //Parse languages safely
    let parsedLanguages = [];
    try {
      parsedLanguages =
        typeof languages === "string" ? JSON.parse(languages) : languages;
    } catch (err) {
      console.warn("[Driver] Invalid JSON in languages:", err.message);
    }

    // Extract Cloudinary image URLs (if files exist)
    const photoURLs =
      req.files?.photos.length > 0
        ? req.files.photos.map((file) => file.path)
        : [];

    //Handle avatar separately
    const avatarURL =
      req.files?.avatar?.length > 0 ? req.files.avatar[0].path : null;

    const newDriver = new Driver({
      firstName,
      lastName,
      dateOfBirth,
      email,
      phoneNo,
      country,
      baseLocation,
      vehicleCapacity,
      startTime,
      endTime,
      breakStartTime,
      breakEndTime,
      priority,
      activeDays: parsedActiveDays,
      photos: photoURLs,
      avatar: avatarURL,
      languages: parsedLanguages,
      gender,
    });

    const saved = await newDriver.save();
    console.log("[Driver] Saved successfully:", saved._id);
    res.status(201).json(saved);
  } catch (err) {
    console.error("[Driver] Internal server error:", err.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// PUT update driver by ID
const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return res.status(404).json({ error: "Driver not found" });
  }

  // Update normal fields
  Object.assign(driver, req.body);

  if (req.body.activeDays && typeof req.body.activeDays === "string") {
    try {
      driver.activeDays = JSON.parse(req.body.activeDays);
    } catch (err) {
      console.warn("[Driver] Invalid JSON in activeDays:", err.message);
    }
  }

  if (req.body.languages && typeof req.body.languages === "string") {
    try {
      driver.languages = JSON.parse(req.body.languages);
    } catch (err) {
      console.warn("[Driver] Invalid JSON in languages:", err.message);
    }
  }

  // Handle uploaded files
  if (req.files?.photos && req.files.photos.length > 0) {
    driver.photos = req.files.photos.map((file) => file.path);
  }

  if (req.files?.avatar && req.files.avatar.length > 0) {
    driver.avatar = req.files.avatar[0].path;
  }

  const updated = await driver.save();
  console.log(`[Driver] Updated driver: ${updated._id}`);
  res.status(200).json(updated);
});

// DELETE driver by ID
const deleteDriver = asyncHandler(async (req, res) => {
  const deleted = await Driver.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Driver not found" });
  }
  console.log(`[Driver] Deleted driver: ${deleted._id}`);
  res.status(200).json({ message: "Driver deleted", id: deleted._id });
});

module.exports = {
  getDrivers,
  getDriverByID,
  postDriver,
  updateDriver,
  deleteDriver,
};
