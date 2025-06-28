const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
const {
  sendFriendRequest,
  getReceivedRequests,
  acceptFriendRequest,
  getFriendsList,
  rejectFriendRequest,
  directAddFriend,
} = require("../controllers/friendsController");
/**
 * @swagger
 * /api/friends/request:
 *   post:
 *     summary: 發送好友邀請
 *     tags: [Friends]
 */
router.post("/request", sendFriendRequest);
/**
 * @swagger
 * /api/friends/requests:
 *   get:
 *     summary: 取得收到的好友邀請
 *     tags: [Friends]
 */
router.get("/requests", getReceivedRequests);
/**
 * @swagger
 * /api/friends/accept:
 *   post:
 *     summary: 接受好友邀請
 *     tags: [Friends]
 */
router.post("/accept", acceptFriendRequest);
/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: 取得好友列表
 *     tags: [Friends]
 */
router.get("/", getFriendsList);
/**
 * @swagger
 * /api/friends/requests/{id}:
 *   delete:
 *     summary: 拒絕好友邀請
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete("/requests/:id", rejectFriendRequest);

router.post("/direct-add", authMiddleware, directAddFriend);

module.exports = router;
