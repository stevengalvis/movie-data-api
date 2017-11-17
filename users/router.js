const express = require("express");
const bodyParser = require("body-parser");

const { User } = require("./models");

const router = express.Router();
const passport = require("passport");
const jsonParser = bodyParser.json();

// register a new user
router.post("/", jsonParser, (req, res) => {
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

router.post("/watchlist", passport.authenticate("jwt", { session: false }), (req, res) => {
  let user;
  User.findOneAndUpdate({ username: req.user.username }, { $push: { watchList: req.body } }, { new: true })
    .exec()
    .then(_user => {
      user = _user;
      res.status(201).json(user.apiWatchList());
    })
    .catch(err => res.status(500).json({ message: "Something went wrong" }));
});

router.get("/watchlist", passport.authenticate("jwt", { session: false }), (req, res) => {
  let user;
  User.findOne({ username: req.user.username })
    .exec()
    .then(_user => {
      user = _user;
      res.status(201).json(user.apiWatchList());
    })
    .catch(err => res.status(500).json({ message: "could not get watch list" }));
});

router.put("/watchlist", passport.authenticate("jwt", { session: false }), (req, res) => {
  let user;
  User.findOneAndUpdate({ username: req.user.username }, { $pull: { watchList: { id: req.body.id } } }, { new: true })
    .exec()
    .then(_user => {
      user = _user;
      res.status(201).json(user.apiWatchList());
    })
    .catch(err => res.status(500).json({ message: "could not delete item" }));
});

module.exports = { router };
