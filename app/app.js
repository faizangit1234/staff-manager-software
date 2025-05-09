const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.config.js");
const dotenv = require("dotenv");
const professionalRoutes = require("../app/routes/professional.routes.js");
const driverRoutes = require("../app/routes/driver.routes.js");
const userRoutes = require("../app/routes/user.routes.js");
const scheduleRoutes = require("../app/routes/schedule.routes.js");
const errorMiddleware = require("./middlewares/error.middleware.js");
const notFoundMiddleware = require("./middlewares/notFound.middleware.js");

dotenv.config();
const app = express();
connectDB();

app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/schedules", scheduleRoutes);

// Error handler
app.use(errorMiddleware);
app.use(notFoundMiddleware);

module.exports = app;
