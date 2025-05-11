// Description: This file contains the controller functions for handling driver-related operations.

const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config(); // Ensure env is loaded

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "MISSING",
  api_key: process.env.CLOUDINARY_API_KEY || "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET || "MISSING",
});

console.log("[Cloudinary] Config Loaded:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
});

module.exports = cloudinary;
