const express = require("express");
const router = express.Router();
const {
  getDrivers,
  postDriver,
  getDriverByID,
  updateDriver,
  deleteDriver,
} = require("../controllers/driver.controllers.js");

router.route("/").get(getDrivers).post(postDriver);
router.route("/:id").get(getDriverByID).put(updateDriver).delete(deleteDriver);

module.exports = router;
