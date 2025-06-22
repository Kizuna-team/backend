const express = require("express");
const router = express.Router();

const {
  saveUserInterests,
  saveUserPreference,
} = require("../controllers/userFilterControllers.js");

const authMiddleware = require("../middleware/auth.js");

router.post("/interests", authMiddleware, saveUserInterests);
router.post("/preference", authMiddleware, saveUserPreference);

module.exports = router;
