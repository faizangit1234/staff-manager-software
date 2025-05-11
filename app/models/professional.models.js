const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema(
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
    phone: { type: Number, required: [true, "Phone number is required"] },
    country: { type: String, required: [true, "Country is required"] },
    language: { type: String, required: [true, "Language is required"] },
    address: { type: String, required: [true, "Address is required"] },
    location: { type: String, required: [true, "Location is required"] },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
    },
    yearsOfExperience: {
      type: String,
      required: [true, "Years of experience is required"],
    },
    certification: {
      type: String,
      required: [true, "Certification is required"],
    },
    skills: { type: String, required: [true, "Skills are required"] },
    bio: { type: String, required: [true, "Bio is required"] },
    services: { type: String, required: [true, "Services are required"] },
    startTime: { type: String, required: [true, "Start time is required"] },
    endTime: { type: String, required: [true, "End time is required"] },
    activeForNightShifts: { type: Boolean, default: false },
    activeDays: {
      type: [String],
      default: [],
      validate: {
        validator: Array.isArray,
        message: "Active days should be an array of strings",
      },
    },
  },
  { timestamps: true },
);

// Logging middleware
professionalSchema.pre("save", function (next) {
  console.log(
    `[Professional] Saving new professional: ${this.firstName} ${this.lastName}`,
  );
  next();
});

professionalSchema.post("save", function (doc) {
  console.log(`[Professional] Successfully saved: ${doc._id}`);
});

professionalSchema.post("error", function (error, doc, next) {
  console.error(`[Professional] Error occurred while saving:`, error.message);
  next(error);
});

module.exports = mongoose.model("Professional", professionalSchema);
