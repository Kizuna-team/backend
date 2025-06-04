const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityControllers.js");
const authMiddleware = require("../middleware/auth.js");

router.get("/", activityController.getAllActivities);
router.get("/:id", authMiddleware, activityController.getActivityById);
router.post("/", authMiddleware, activityController.createActivity);
router.put("/:id", authMiddleware, activityController.updateActivity);
router.delete("/:id", authMiddleware, activityController.deleteActivity);

module.exports = router;
