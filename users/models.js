const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  watchList: { type: Array, default: [] }
});

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username || "",
    firstName: this.firstName || "",
    lastName: this.lastName || ""
  };
};

UserSchema.methods.apiWatchList = function() {
  return {
    watchList: this.watchList || []
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };
