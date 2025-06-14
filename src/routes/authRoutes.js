const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const redirectUrl = `http://localhost:5173/oauth-success?token=${token}`;
    res.redirect(redirectUrl);
  }
);

module.exports = router;
