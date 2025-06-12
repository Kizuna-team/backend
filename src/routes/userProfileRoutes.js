const express = require("express");
const router = express.Router();
const {
  getProfileById,
  getAllProfiles,
} = require("../controllers/userProfileControllers");

router.get("/me", getProfileById);
router.get("/:userId", getAllProfiles);

module.exports = router;
