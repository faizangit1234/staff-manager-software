// Description: This file contains the controller functions for handling driver-related operations.

const asyncHandler = require("express-async-handler");
const Schedule = require("../models/Schedule.models.js");
const Professional = require("../models/professional.models.js");
const Driver = require("../models/driver.models.js");

// Helper: Check overlapping time ranges
function isOverlap(existing, { date, startTime, endTime }) {
  return (
    existing.date.toISOString() === date.toISOString() &&
    existing.startTime < endTime &&
    existing.endTime > startTime
  );
}

// Helper: Time within range
function isWithinTimeRange(start, end, targetStart, targetEnd) {
  return start <= targetStart && end >= targetEnd;
}

// Helper: Day is active
function isActiveOnDay(entity, day) {
  return Array.isArray(entity.activeDays) && entity.activeDays.includes(day);
}

// GET all schedules
const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find().populate("professional driver");
  console.log(`[Schedule] Fetched ${schedules.length} schedule(s)`);
  res.status(200).json(schedules);
});

// POST schedule
const postSchedule = asyncHandler(async (req, res) => {
  const {
    professional,
    driver,
    clientName,
    day,
    date,
    startTime,
    endTime,
    destination,
  } = req.body;

  if (!professional || !driver || !clientName || !day || !date || !startTime || !endTime) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  const pro = await Professional.findById(professional);
  const drv = await Driver.findById(driver);
  if (!pro || !drv) {
    return res.status(400).json({ error: "Invalid professional or driver ID." });
  }

  if (!isActiveOnDay(drv, day)) {
    return res.status(409).json({ error: `Driver is not active on ${day}` });
  }
  if (!isActiveOnDay(pro, day)) {
    return res.status(409).json({ error: `Professional is not active on ${day}` });
  }

  if (!isWithinTimeRange(drv.startTime, drv.endTime, startTime, endTime)) {
    return res.status(409).json({ error: "Schedule time is outside driver's working hours." });
  }
  if (!isWithinTimeRange(pro.startTime, pro.endTime, startTime, endTime)) {
    return res.status(409).json({ error: "Schedule time is outside professional's working hours." });
  }

  const exact = await Schedule.findOne({
    professional,
    driver,
    date: parsedDate,
    startTime,
    endTime,
  });
  if (exact) {
    return res.status(409).json({ error: "An identical schedule already exists." });
  }

  const sameDaySchedules = await Schedule.find({ date: parsedDate });

  const overlapDriver = sameDaySchedules.find(
    (s) => s.driver.equals(driver) && isOverlap(s, { date: parsedDate, startTime, endTime })
  );
  if (overlapDriver) {
    return res.status(409).json({ error: "Driver is already scheduled during this time." });
  }

  const overlapPro = sameDaySchedules.find(
    (s) => s.professional.equals(professional) && isOverlap(s, { date: parsedDate, startTime, endTime })
  );
  if (overlapPro) {
    return res.status(409).json({ error: "Professional is already scheduled during this time." });
  }

  const schedule = new Schedule({
    professional,
    driver,
    clientName,
    day,
    date: parsedDate,
    startTime,
    endTime,
    destination,
  });

  const saved = await schedule.save();
  console.log(`[Schedule] Created: ${saved._id}`);
  res.status(201).json(saved);
});

// PUT schedule
const updateSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    professional,
    driver,
    clientName,
    day,
    date,
    startTime,
    endTime,
    destination,
  } = req.body;

  const parsedDate = new Date(date);
  if (!professional || !driver || !clientName || !day || isNaN(parsedDate) || !startTime || !endTime) {
    return res.status(400).json({ error: "All required fields must be provided correctly." });
  }

  const pro = await Professional.findById(professional);
  const drv = await Driver.findById(driver);
  if (!pro || !drv) {
    return res.status(400).json({ error: "Invalid professional or driver ID." });
  }

  if (!isActiveOnDay(drv, day)) {
    return res.status(409).json({ error: `Driver is not active on ${day}` });
  }
  if (!isActiveOnDay(pro, day)) {
    return res.status(409).json({ error: `Professional is not active on ${day}` });
  }

  if (!isWithinTimeRange(drv.startTime, drv.endTime, startTime, endTime)) {
    return res.status(409).json({ error: "Schedule time is outside driver's working hours." });
  }
  if (!isWithinTimeRange(pro.startTime, pro.endTime, startTime, endTime)) {
    return res.status(409).json({ error: "Schedule time is outside professional's working hours." });
  }

  const sameDaySchedules = await Schedule.find({ _id: { $ne: id }, date: parsedDate });

  const duplicate = sameDaySchedules.find(
    (s) =>
      s.professional.equals(professional) &&
      s.driver.equals(driver) &&
      s.startTime === startTime &&
      s.endTime === endTime
  );
  if (duplicate) {
    return res.status(409).json({ error: "An identical schedule already exists." });
  }

  const overlapDriver = sameDaySchedules.find(
    (s) => s.driver.equals(driver) && isOverlap(s, { date: parsedDate, startTime, endTime })
  );
  if (overlapDriver) {
    return res.status(409).json({ error: "Driver is already scheduled during this time." });
  }

  const overlapPro = sameDaySchedules.find(
    (s) => s.professional.equals(professional) && isOverlap(s, { date: parsedDate, startTime, endTime })
  );
  if (overlapPro) {
    return res.status(409).json({ error: "Professional is already scheduled during this time." });
  }

  const updated = await Schedule.findByIdAndUpdate(
    id,
    {
      professional,
      driver,
      clientName,
      day,
      date: parsedDate,
      startTime,
      endTime,
      destination,
    },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ error: "Schedule not found" });
  }

  console.log(`[Schedule] Updated: ${updated._id}`);
  res.status(200).json(updated);
});

// DELETE schedule
const deleteSchedule = asyncHandler(async (req, res) => {
  const deleted = await Schedule.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Schedule not found" });
  }
  console.log(`[Schedule] Deleted: ${deleted._id}`);
  res.status(200).json({ message: "Schedule deleted", deleted });
});

module.exports = {
  getSchedules,
  postSchedule,
  updateSchedule,
  deleteSchedule,
};
