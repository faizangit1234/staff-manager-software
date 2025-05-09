const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validateToken.middleware.js");
const checkrole = require("../middlewares/checkRole.js");
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
  .post(validateToken, checkrole("admin", "superAdmin"), postProfessional);

// GET - Get professional by ID
router
  .route("/:id")
  .get(validateToken, checkrole("admin", "superAdmin"), getProfessionalByID)
  .put(validateToken, checkrole("admin", "superAdmin"), updateProfessional)
  .delete(validateToken, checkrole("admin", "superAdmin"), deleteProfessional);

module.exports = router;
