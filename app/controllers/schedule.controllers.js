const asyncHandler = require("express-async-handler");
const Schedule = require("../models/Schedule.models.js");

// GET - Get all Schedules
const getSchedules = asyncHandler(async (req, res) => {
  try {
    const schedules = await Schedule.find().populate("professional driver");
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add new Schedule
const postSchedule = asyncHandler(async (req, res) => {
  try {
    const { professional, driver } = req.body;

    // Check if IDs exist
    const proExists = await Professional.findById(professional);
    const driverExists = await Driver.findById(driver);
    if (!proExists || !driverExists) {
      return res.status(400).json({ error: "Invalid Professional/Driver ID" });
    }

    const newSchedule = new Schedule(req.body);
    const saved = await newSchedule.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const updateSchedule = asyncHandler(async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const deleteSchedule = asyncHandler(async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  getSchedules,
  postSchedule,
  updateSchedule,
  deleteSchedule,
};
