const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    clientName: { type: String, required: true },
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    date: { type: Date, required: true }, // for calendar filtering
    startTime: { type: String, required: true }, // e.g. "13:00"
    endTime: { type: String, required: true }, // e.g. "15:00"
    destination: { type: String },
    description: { type: String },
    service: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Schedule", scheduleSchema);
