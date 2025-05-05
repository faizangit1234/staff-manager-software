const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.config.js");
const dotenv = require("dotenv");
const professionalRoutes = require("../app/routes/professional.routes.js");
const driverRoutes = require("../app/routes/driver.routes.js");
const scheduleRoutes = require("../app/routes/schedule.routes.js");
const errorMiddleware = require("./middlewares/error.middleware.js");
const notFoundMiddleware = require("./middlewares/notFound.middleware.js");

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Error handler
app.use(errorMiddleware);
app.use(notFoundMiddleware);

// Routes
app.use("/api/professionals", professionalRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/schedules", scheduleRoutes);

module.exports = app;
