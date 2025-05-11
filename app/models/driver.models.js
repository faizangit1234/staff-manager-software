// Description: This file contains the controller functions for handling driver-related operations.

const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    dateOfBirth: {
      type: String,
      required: [true, "Date of birth is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNo: { type: Number, required: [true, "Phone number is required"] },
    country: { type: String, required: [true, "Country is required"] },
    baseLocation: {
      type: String,
      required: [true, "Base location is required"],
    },
    vehicleCapacity: {
      type: Number,
      required: [true, "Vehicle capacity is required"],
      min: [1, "Vehicle capacity must be at least 1"],
    },
    startTime: { type: String, required: [true, "Start time is required"] },
    endTime: { type: String, required: [true, "End time is required"] },
    breakStartTime: {
      type: String,
      required: [true, "Break start time is required"],
    },
    breakEndTime: {
      type: String,
      required: [true, "Break end time is required"],
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: ["High", "Medium", "Low"],
    },
    activeDays: {
      type: [String],
      default: [],
      validate: {
        validator: Array.isArray,
        message: "Active days should be an array of strings",
      },
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: Array.isArray,
        message: "Photos should be an array of strings (URLs or filenames)",
      },
    },
  },
  { timestamps: true },
);

// Logging middleware
driverSchema.pre("save", function (next) {
  console.log(`[Driver] Saving new driver: ${this.firstName} ${this.lastName}`);
  next();
});

driverSchema.post("save", function (doc) {
  console.log(`[Driver] Successfully saved: ${doc._id}`);
});

driverSchema.post("error", function (error, doc, next) {
  console.error(`[Driver] Error occurred while saving:`, error.message);
  next(error);
});

module.exports = mongoose.model("Driver", driverSchema);
