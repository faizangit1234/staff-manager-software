const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validateToken.middleware.js");
const checkrole = require("../middlewares/checkRole.js");
const upload = require("../utils/multer");
const {
  getSchedules,
  postSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleById,
} = require("../controllers/schedule.controllers.js");

router
  .route("/")
  .get(validateToken, checkrole("admin", "superAdmin"), getSchedules)
  .post(
    validateToken,
    checkrole("admin", "superAdmin"),
    upload.none(),
    postSchedule,
  );
router
  .route("/:id")
  .get(validateToken, checkrole("admin", "superAdmin"), getScheduleById)
  .put(validateToken, checkrole("admin", "superAdmin"), updateSchedule)
  .delete(validateToken, checkrole("admin", "superAdmin"), deleteSchedule);

module.exports = router;
