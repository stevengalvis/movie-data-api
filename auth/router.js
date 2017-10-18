const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const config = require("../config");

const createAuthToken = user => {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: "HS256"
  });
};

const router = express.Router();

router.post(
  "/login",
  //user provides a username and password to log in
  passport.authenticate("basic", { session: false }),
  (req, res) => {
    const authToken = createAuthToken(req.user.apiRepr());
    res.json({ authToken });
  }
);

router.post(
  "/refresh",
  // user exchanges an existing valid JWT for a new one with a later
  // expiration date
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({ authToken });
  }
);

module.exports = { router };
