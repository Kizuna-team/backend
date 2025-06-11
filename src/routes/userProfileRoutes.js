const express = require("express");
const router = express.Router();
const {
  getProfileById,
  getAllProfiles,
} = require("../controllers/userProfileControllers");

router.get("/profile/:userId", getProfileById);
router.get("/profiles", getAllProfiles);
module.exports = router;
