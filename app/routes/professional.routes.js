const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validateToken.middleware.js");
const checkrole = require("../middlewares/checkRole.js");
const { upload2 } = require("../utils/multer");
const {
  getProfessionals,
  postProfessional,
  getProfessionalByID,
  updateProfessional,
  deleteProfessional,
} = require("../controllers/professional.controllers.js");

router
  .route("/")
  .get(validateToken, checkrole("admin", "superAdmin"), getProfessionals)
  .post(
    validateToken,
    checkrole("admin", "superAdmin"),
    upload2.fields([
      { name: "avatar", maxCount: 1 },
      { name: "photos", maxCount: 5 },
    ]),
    postProfessional,
  );

// GET - Get professional by ID
router
  .route("/:id")
  .get(validateToken, checkrole("admin", "superAdmin"), getProfessionalByID)
  .put(
    validateToken,
    checkrole("admin", "superAdmin"),
    upload2.fields([
      { name: "avatar", maxCount: 1 },
      { name: "photos", maxCount: 5 },
    ]),
    updateProfessional,
  )
  .delete(validateToken, checkrole("admin", "superAdmin"), deleteProfessional);

module.exports = router;
