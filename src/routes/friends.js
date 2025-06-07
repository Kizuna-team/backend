const express = require("express");
const router = express.Router();
const { getFriends } = require("../controllers/friendsController");


router.get("/", getFriends); 

module.exports = router;
