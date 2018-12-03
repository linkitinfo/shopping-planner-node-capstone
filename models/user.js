"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false,
    trim: true
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  active: {
    type: Boolean,
    default: false
  },
  activeEmailToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  facebook: {
    type: Boolean,
    default: false
  },
  google: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

userSchema.statics.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.method.validatePassword = function(password, callback) {
  bcrypt.compare(password, this.password, (err, isValid) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, isValid);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
