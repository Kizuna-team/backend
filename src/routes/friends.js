const express = require("express");
const router = express.Router();
const {
  sendFriendRequest,
  getReceivedRequests,
  acceptFriendRequest,
  getFriendsList,
  rejectFriendRequest,
} = require("../controllers/friendsController");

router.post("/request", sendFriendRequest);      
router.get("/requests", getReceivedRequests);      
router.post("/accept", acceptFriendRequest);      
router.get("/", getFriendsList);    
router.delete("/requests/:id", rejectFriendRequest);                

module.exports = router;
