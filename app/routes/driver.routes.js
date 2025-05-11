const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validateToken.middleware.js");
const checkrole = require("../middlewares/checkRole.js");
const {
  getDrivers,
  postDriver,
  getDriverByID,
  updateDriver,
  deleteDriver,
} = require("../controllers/driver.controllers.js");
const upload = require("../utils/multer.js");

router
  .route("/")
  .get(validateToken, checkrole("admin", "superAdmin"), getDrivers)
  .post(
    validateToken,
    checkrole("admin", "superAdmin"),
    upload.array("photos", 5),
    postDriver,
  );
router
  .route("/:id")
  .get(validateToken, checkrole("admin", "superAdmin"), getDriverByID)
  .put(validateToken, checkrole("admin", "superAdmin"), updateDriver)
  .delete(validateToken, checkrole("admin", "superAdmin"), deleteDriver);

module.exports = router;
