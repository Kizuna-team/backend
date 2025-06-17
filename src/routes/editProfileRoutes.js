const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  getProfile,
  updateProfile,
  createProfile,
} = require("../controllers/editProfileController.js");

router.get("/", authMiddleware, getProfile);
router.post("/", authMiddleware, createProfile);
router.patch("/", authMiddleware, updateProfile);

module.exports = router;
