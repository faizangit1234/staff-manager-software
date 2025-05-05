const asyncHandler = require("express-async-handler");
const Driver = require("../models/driver.models.js");

// GET - Get all drivers
const getDrivers = asyncHandler(async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add a new driver
const postDriver = asyncHandler(async (req, res) => {
  try {
    const newDriver = new Driver(req.body);
    const saved = await newDriver.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Get single driver by ID
const getDriverByID = asyncHandler(async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update driver by ID
const updateDriver = asyncHandler(async (req, res) => {
  try {
    const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Delete driver by ID
const deleteDriver = asyncHandler(async (req, res) => {
  try {
    const deleted = await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: "Driver deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  getDrivers,
  postDriver,
  getDriverByID,
  updateDriver,
  deleteDriver,
};
