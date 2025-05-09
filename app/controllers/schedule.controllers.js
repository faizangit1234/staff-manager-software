const asyncHandler = require("express-async-handler");
const Schedule = require("../models/Schedule.models.js");
const Professional = require("../models/professional.models.js");
const Driver = require("../models/driver.models.js");

// Utility to check overlapping times
function isOverlap(existing, { date, startTime, endTime }) {
  return (
    existing.date.toISOString() === date.toISOString() &&
    existing.startTime < endTime &&
    existing.endTime > startTime
  );
}

// GET - Get all Schedules
const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find().populate("professional driver");
  res.json(schedules);
});

// POST - Add new Schedule
const postSchedule = asyncHandler(async (req, res) => {
  const { professional, driver, date, startTime, endTime } = req.body;

  // Validate IDs
  const pro = await Professional.findById(professional);
  const drv = await Driver.findById(driver);
  if (!pro || !drv) {
    return res.status(400).json({ error: "Invalid professional or driver ID" });
  }

  // Validate time ordering
  if (new Date(startTime) >= new Date(endTime)) {
    return res
      .status(400)
      .json({ error: "Start time must be before end time" });
  }

  // Check exact duplicate
  const duplicate = await Schedule.findOne({
    professional,
    driver,
    date,
    startTime,
    endTime,
  });
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "This exact schedule already exists" });
  }

  // Check overlapping for driver
  const driverBusy = await Schedule.find({ driver });
  if (
    driverBusy.some((s) =>
      isOverlap(s, {
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }),
    )
  ) {
    return res
      .status(409)
      .json({ error: "Driver has another schedule at this time" });
  }

  // Check overlapping for professional
  const profBusy = await Schedule.find({ professional });
  if (
    profBusy.some((s) =>
      isOverlap(s, {
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      }),
    )
  ) {
    return res
      .status(409)
      .json({ error: "Professional has another schedule at this time" });
  }

  // Save
  const schedule = new Schedule(req.body);
  const saved = await schedule.save();
  res.status(201).json(saved);
});

// PUT - Update Schedule
const updateSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { professional, driver, date, startTime, endTime } = req.body;

  // Validate IDs
  const pro = await Professional.findById(professional);
  const drv = await Driver.findById(driver);
  if (!pro || !drv) {
    return res.status(400).json({ error: "Invalid professional or driver ID" });
  }

  if (new Date(startTime) >= new Date(endTime)) {
    return res
      .status(400)
      .json({ error: "Start time must be before end time" });
  }

  // Exclude current schedule when checking duplicates/overlaps
  const otherSchedules = await Schedule.find({ _id: { $ne: id } });

  // Duplicate
  if (
    otherSchedules.some(
      (s) =>
        s.professional.equals(professional) &&
        s.driver.equals(driver) &&
        s.date.toISOString() === new Date(date).toISOString() &&
        s.startTime.getTime() === new Date(startTime).getTime() &&
        s.endTime.getTime() === new Date(endTime).getTime(),
    )
  ) {
    return res
      .status(409)
      .json({ error: "This exact schedule already exists" });
  }

  // Overlaps
  if (
    otherSchedules.some(
      (s) =>
        s.driver.equals(driver) &&
        isOverlap(s, {
          date: new Date(date),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        }),
    )
  ) {
    return res
      .status(409)
      .json({ error: "Driver has another schedule at this time" });
  }

  if (
    otherSchedules.some(
      (s) =>
        s.professional.equals(professional) &&
        isOverlap(s, {
          date: new Date(date),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        }),
    )
  ) {
    return res
      .status(409)
      .json({ error: "Professional has another schedule at this time" });
  }

  const updated = await Schedule.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updated);
});

// DELETE - Delete Schedule
const deleteSchedule = asyncHandler(async (req, res) => {
  const deleted = await Schedule.findByIdAndDelete(req.params.id);
  res.json({ message: "Schedule deleted", deleted });
});

module.exports = {
  getSchedules,
  postSchedule,
  updateSchedule,
  deleteSchedule,
};
