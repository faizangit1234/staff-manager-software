const express = require("express");
const router = express.Router();
const {
  getProfessionals,
  postProfessional,
  getProfessionalByID,
  updateProfessional,
  deleteProfessional,
} = require("../controllers/professional.controllers.js");

router.route("/").get(getProfessionals).post(postProfessional);

// GET - Get professional by ID
router
  .route("/:id")
  .get(getProfessionalByID)
  .put(updateProfessional)
  .delete(deleteProfessional);

module.exports = router;
