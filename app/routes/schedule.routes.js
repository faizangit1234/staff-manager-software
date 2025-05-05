const express = require("express");
const router = express.Router();
const {
  getSchedules,
  postSchedule,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/schedule.controllers.js");

router.route("/").get(getSchedules).post(postSchedule);
router
  .route("/:id")
  .put(updateSchedule) // Add this
  .delete(deleteSchedule); // Add this

module.exports = router;
