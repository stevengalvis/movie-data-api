const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const morgan = require("morgan");

const { router: usersRouter } = require("./users");
const { router: authRouter, basicStrategy, jwtStrategy } = require("./auth/index");
console.log(basicStrategy);
mongoose.Promise = global.Promise;

const app = express();

//Logging
app.use(morgan("common"));

const cors = require("cors");
const { CLIENT_ORIGIN, PORT, DATABASE_URL } = require("./config");

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(bodyParser.json());

app.use("/api/auth/", authRouter);
app.use("/api/users/", usersRouter);
app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);

app.get("/api/*", (req, res) => {
  res.json({ ok: true });
});

// closeServer needs access to a server object but it is only crated when `runServer` runs, so we declare `server` here and then assign a value to it in run
let server;

// this connects to our database, then starts the server>
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on ${port}`);
          resolve();
        })
        .on("error", err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a Promise

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
