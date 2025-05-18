// Description: This file contains the controller functions for handling driver-related operations.

const asyncHandler = require("express-async-handler");
const { Parser } = require("json2csv");
const moment = require("moment");
const Schedule = require("../models/Schedule.models.js");
const Professional = require("../models/professional.models.js");
const Driver = require("../models/driver.models.js");

// Logging helper
const log = (msg) => console.log(`[Schedule Controller] ${msg}`);

// Overlap checker
function isOverlap(existing, { date, startTime, endTime }) {
  return (
    existing.date.toISOString() === date.toISOString() &&
    existing.startTime < endTime &&
    existing.endTime > startTime
  );
}

// Time range check
function isWithinTimeRange(start, end, targetStart, targetEnd) {
  return start <= targetStart && end >= targetEnd;
}

// Day check
function isActiveOnDay(entity, day) {
  return Array.isArray(entity.activeDays) && entity.activeDays.includes(day);
}

// GET all
const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await Schedule.find()
    .populate("professional driver")
    .sort({ createdAt: -1 });
  log(`Fetched ${schedules.length} schedule(s)`);
  res.status(200).json(schedules);
});

// POST
const postSchedule = asyncHandler(async (req, res) => {
  const {
    professional,
    driver,
    clientName,
    date,
    startTime,
    endTime,
    destination,
    description,
    service,
    status,
  } = req.body;

  // Trim & length validations
  if (clientName.trim().length < 3) {
    return res.status(400).json({ error: "Client name too short." });
  }
  if (description && description.trim().length > 500) {
    return res
      .status(400)
      .json({ error: "Description too long (max 500 chars)." });
  }
  if (service && service.trim().length > 100) {
    return res
      .status(400)
      .json({ error: "Service name too long (max 100 chars)." });
  }

  // Status check
  const validStatuses = ["Pending", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  if (
    !professional ||
    !driver ||
    !clientName ||
    !date ||
    !startTime ||
    !endTime
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided." });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  const day = moment(parsedDate).format("dddd"); // e.g., "Monday"

  // Prevent backdated
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) {
    return res
      .status(400)
      .json({ error: "Schedule date cannot be in the past." });
  }

  // Time format
  const isTimeValid = (time) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time);
  if (!isTimeValid(startTime) || !isTimeValid(endTime)) {
    return res.status(400).json({ error: "Time must be in HH:mm format." });
  }
  if (startTime >= endTime) {
    return res
      .status(400)
      .json({ error: "Start time must be before end time." });
  }

  // IDs valid
  const pro = await Professional.findById(professional);
  const drv = await Driver.findById(driver);
  if (!pro || !drv) {
    return res
      .status(400)
      .json({ error: "Invalid professional or driver ID." });
  }

  // Ensure not same person
  if (professional === driver) {
    return res
      .status(400)
      .json({ error: "Driver and Professional cannot be the same person." });
  }

  // Day active
  if (!isActiveOnDay(drv, day)) {
    return res.status(409).json({ error: `Driver is not active on ${day}` });
  }
  if (!isActiveOnDay(pro, day)) {
    return res
      .status(409)
      .json({ error: `Professional is not active on ${day}` });
  }

  // Time within range
  if (!isWithinTimeRange(drv.startTime, drv.endTime, startTime, endTime)) {
    return res
      .status(409)
      .json({ error: "Schedule time is outside driver's working hours." });
  }
  if (!isWithinTimeRange(pro.startTime, pro.endTime, startTime, endTime)) {
    return res.status(409).json({
      error: "Schedule time is outside professional's working hours.",
    });
  }

  // Exact match check
  const exact = await Schedule.findOne({
    professional,
    driver,
    date: parsedDate,
    startTime,
    endTime,
  });
  if (exact) {
    return res
      .status(409)
      .json({ error: "An identical schedule already exists." });
  }

  const sameDaySchedules = await Schedule.find({ date: parsedDate });

  // Overlap check (ignoring cancelled)
  const overlapDriver = sameDaySchedules.find(
    (s) =>
      s.driver.equals(driver) &&
      s.status !== "cancelled" &&
      isOverlap(s, { date: parsedDate, startTime, endTime }),
  );
  if (overlapDriver) {
    return res
      .status(409)
      .json({ error: "Driver is already scheduled during this time." });
  }

  const overlapPro = sameDaySchedules.find(
    (s) =>
      s.professional.equals(professional) &&
      s.status !== "cancelled" &&
      isOverlap(s, { date: parsedDate, startTime, endTime }),
  );
  if (overlapPro) {
    return res
      .status(409)
      .json({ error: "Professional is already scheduled during this time." });
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
    description,
    service,
    status,
  });

  const saved = await schedule.save();
  log(`Created schedule: ${saved._id}`);
  res.status(201).json(saved);
});

// PUT Schedule (similar enhancements)
const updateSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    professional,
    driver,
    clientName,
    date,
    startTime,
    endTime,
    destination,
    description,
    service,
    status,
  } = req.body;

  const parsedDate = new Date(date);
  const day = moment(parsedDate).format("dddd");
  if (
    !professional ||
    !driver ||
    !clientName ||
    isNaN(parsedDate) ||
    !startTime ||
    !endTime
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided correctly." });
  }

  // Trim & length validations
  if (clientName.trim().length < 3) {
    return res.status(400).json({ error: "Client name too short." });
  }
  if (description && description.trim().length > 500) {
    return res
      .status(400)
      .json({ error: "Description too long (max 500 chars)." });
  }
  if (service && service.trim().length > 100) {
    return res
      .status(400)
      .json({ error: "Service name too long (max 100 chars)." });
  }

  const validStatuses = ["Pending", "Completed", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) {
    return res
      .status(400)
      .json({ error: "Schedule date cannot be in the past." });
  }

  const isTimeValid = (time) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time);
  if (!isTimeValid(startTime) || !isTimeValid(endTime)) {
    return res.status(400).json({ error: "Time must be in HH:mm format." });
  }
  if (startTime >= endTime) {
    return res
      .status(400)
      .json({ error: "Start time must be before end time." });
  }

  const pro = await Professional.findById(professional);
  const drv = await Driver.findById(driver);
  if (!pro || !drv) {
    return res
      .status(400)
      .json({ error: "Invalid professional or driver ID." });
  }

  if (professional === driver) {
    return res
      .status(400)
      .json({ error: "Driver and Professional cannot be the same person." });
  }

  if (!isActiveOnDay(drv, day)) {
    return res.status(409).json({ error: `Driver is not active on ${day}` });
  }
  if (!isActiveOnDay(pro, day)) {
    return res
      .status(409)
      .json({ error: `Professional is not active on ${day}` });
  }

  if (!isWithinTimeRange(drv.startTime, drv.endTime, startTime, endTime)) {
    return res
      .status(409)
      .json({ error: "Schedule time is outside driver's working hours." });
  }
  if (!isWithinTimeRange(pro.startTime, pro.endTime, startTime, endTime)) {
    return res.status(409).json({
      error: "Schedule time is outside professional's working hours.",
    });
  }

  const sameDaySchedules = await Schedule.find({
    _id: { $ne: id },
    date: parsedDate,
  });

  const duplicate = sameDaySchedules.find(
    (s) =>
      s.professional.equals(professional) &&
      s.driver.equals(driver) &&
      s.startTime === startTime &&
      s.endTime === endTime,
  );
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "An identical schedule already exists." });
  }

  const overlapDriver = sameDaySchedules.find(
    (s) =>
      s.driver.equals(driver) &&
      s.status !== "cancelled" &&
      isOverlap(s, { date: parsedDate, startTime, endTime }),
  );
  if (overlapDriver) {
    return res
      .status(409)
      .json({ error: "Driver is already scheduled during this time." });
  }

  const overlapPro = sameDaySchedules.find(
    (s) =>
      s.professional.equals(professional) &&
      s.status !== "cancelled" &&
      isOverlap(s, { date: parsedDate, startTime, endTime }),
  );
  if (overlapPro) {
    return res
      .status(409)
      .json({ error: "Professional is already scheduled during this time." });
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
      description,
      service,
      status,
    },
    { new: true },
  );

  log(`Updated schedule: ${updated._id}`);
  res.status(200).json(updated);
});

// DELETE schedule
const deleteSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const schedule = await Schedule.findById(id);

  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found." });
  }

  await schedule.deleteOne();
  log(`Deleted schedule: ${id}`);
  res.status(200).json({ message: "Schedule deleted successfully." });
});

// GET schedule by ID
const getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id).populate(
    "professional driver",
  );
  if (!schedule) {
    return res.status(404).json({ error: "Schedule not found" });
  }
  res.status(200).json(schedule);
});

// Export to csv function using from date to date
const exportSchedulesToCSV = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error: "Both fromDate and toDate are required in YYYY-MM-DD format.",
      });
    }

    const start = moment(fromDate);
    const end = moment(toDate);

    if (start.isAfter(end)) {
      return res.status(400).json({
        error: "From date cannot be after To date.",
      });
    }

    const schedules = await Schedule.find({
      date: { $gte: start.toDate(), $lte: end.toDate() },
    })
      .populate("professional", "firstName lastName email")
      .populate("driver", "firstName lastName email");

    const profMap = new Map();

    // Generate list of date strings
    const dateList = [];
    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, "days")) {
      dateList.push(m.format("DD/MM/YYYY"));
    }

    // Initialize map
    schedules.forEach((schedule) => {
      const prof = schedule.professional;
      if (!prof?._id) return;

      const profId = prof._id.toString();
      const fullName = `${prof.firstName} ${prof.lastName}`;
      if (!profMap.has(profId)) {
        const row = {
          Professional: fullName,
          Email: prof.email,
        };
        // Empty values for all dates
        dateList.forEach((dateStr) => {
          row[dateStr] = "";
        });
        profMap.set(profId, row);
      }

      const entry = profMap.get(profId);
      const scheduleDate = moment(schedule.date).format("DD/MM/YYYY");
      const timeSlot = `${schedule.startTime || "?"} - ${schedule.endTime || "?"}`;
      const driverName = schedule.driver
        ? `${schedule.driver.firstName} ${schedule.driver.lastName}`
        : "";
      const client = schedule.clientName || "Unknown Client";

      // Fill formatted text in the correct date column
      entry[scheduleDate] = `${client} ${timeSlot} / ${driverName}`;
    });

    // CSV generation
    const fields = ["Professional", "Email", ...dateList];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(Array.from(profMap.values()));

    res.header("Content-Type", "text/csv");
    res.attachment("schedule.csv");
    return res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    return res.status(500).json({ error: "Failed to export CSV." });
  }
};

module.exports = {
  getSchedules,
  postSchedule,
  updateSchedule,
  getScheduleById,
  deleteSchedule,
  exportSchedulesToCSV,
};
