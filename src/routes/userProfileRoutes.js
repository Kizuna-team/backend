const express = require("express");
const router = express.Router();
const {
  getProfileById,
  getAllProfiles,
} = require("../controllers/userProfileControllers");

router.get("/:userId", getProfileById);
router.get("/", getAllProfiles);

module.exports = router;
