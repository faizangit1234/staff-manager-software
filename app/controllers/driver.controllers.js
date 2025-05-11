// Description: This file contains the controller functions for handling driver-related operations.
const asyncHandler = require("express-async-handler");
const Driver = require("../models/driver.models.js");

// GET all drivers
const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find();
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
  res.status(200).json(driver);
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
      !priority
    ) {
      console.error("[Driver] Missing required fields");
      return res
        .status(400)
        .json({ error: "All required fields must be filled." });
    }

    if (!req.files || req.files.length === 0) {
      console.warn("[Driver] No files uploaded or Multer not triggered");
    } else {
      console.log(
        "[Driver] Uploaded files:",
        req.files.map((f) => f.path),
      );
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

    // Extract Cloudinary image URLs (if files exist)
    const photoURLs =
      req.files?.length > 0 ? req.files.map((file) => file.path) : [];

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

  Object.assign(driver, req.body);
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
