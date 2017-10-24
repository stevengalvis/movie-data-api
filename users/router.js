const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");

const { User } = require("./models");

const router = express.Router();

const jsonParser = bodyParser.json();

// register a new user
router.post("/", jsonParser, (req, res) => {
  const requiredFields = ["username", "password"];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Missing field",
      location: missingField
    });
  }

  const stringFields = ["username", "password", "firstName", "lastName"];
  const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== "string");

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Incorrect field type: expected string",
      location: nonStringField
    });
  }

  // if the username and password arent trimmed we give an error
  const explicitlyTrimmedFields = ["username", "password"];
  const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Cannot start or end with whitespace",
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 10,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => "min" in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(
    field => "max" in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { username, password, firstName = "", lastName = "" } = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        // there is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "Username already taken",
          location: "username"
        });
      }
      // if there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      // forward validation erros on to the client
      if (err.reason === "ValidationError") {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: "Internal server error" });
    });
});

router.put("/watchlist", passport.authenticate("jwt", { session: false }), (req, res) => {
  let user;
  User.findOneAndUpdate({ username: req.user.username }, { $push: { watchList: req.body } }, { new: true })
    .exec()
    .then(_user => {
      user = _user;
      res.status(201).json(user.apiRepr());
    })
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

router.get("/watchlist", (req, res) => {
  let user;
  User.findOne({ username: req.user.username })
    .exec()
    .then(_user => {
      user = _user;
      res.status(201).json(user.apiWatchList());
    })
    .catch(err => res.status(500).json({ message: "could not get watch list" }));
});

router.post("/watchlist", (req, res) => {
  let user;
  User.findOneAndUpdate({ username: req.user.username }, { $pull: { watchList: req.body } }, { new: true })
    .exec()
    .then(_user => {
      user = _user;
      res.status(201).json(user.apiWatchList());
    })
    .catch(err => res.status(500).json({ message: "could not delete item" }));
});

module.exports = { router };
