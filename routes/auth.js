const express = require("express");
const router = express.Router();
const randomstring = require("randomstring");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");

/**
|--------------------------------------------------
| Config
|--------------------------------------------------
*/

const mailKey = require("../config/keys").mailKey;
sgMail.setApiKey(mailKey);

function mailSender(
  to = "test@example.com",
  from = "test@example.com",
  subject = "Sending with SendGrid is Fun",
  text = "and easy to do anywhere, even with Node.js",
  html = "<strong>and easy to do anywhere, even with Node.js</strong>"
) {
  const msg = {
    to,
    from,
    subject,
    text,
    html
  };
  return msg;
}

// End of config

/**
|--------------------------------------------------
| Mongoose models
|--------------------------------------------------
*/

const User = require("../models/user");

// End of models

/**
|--------------------------------------------------
| Validation
|--------------------------------------------------
*/

const registerValiadtion = require("../validation/registerSchemaValiadtion");
const loginValiadtion = require("../validation/loginSchemaValiadtion");

// End of valiadtion

/**
|--------------------------------------------------
| REGISTER
|--------------------------------------------------
*/

router.get("/register", async (req, res) => {
  res.render("pages/register", { errors: {} });
});

router.post("/register", async (req, res) => {
  let { name, email, phone, password, password2 } = req.body;
  // Validation request
  const valid = registerValiadtion.validate(
    { name, email, phone, password, password2 },
    { abortEarly: false }
  );
  if (valid.error !== null) {
    let errors = {};
    valid.error.details.forEach(item => {
      errors[item.path] = true;
    });
    return res.render("pages/register", { user: req.body, errors });
  }
  //   Check user exist or not
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ error: "Email already exists" });
  }
  // Generating hashPassword
  let hash = User.generateHash(password);
  // Making activeToken
  const activeEmailToken = randomstring.generate();
  //   Creating new user
  let newUser = new User({
    name,
    email,
    phone,
    password: hash,
    activeEmailToken
  });
  const createdUser = await newUser.save();
  sgMail.send(
    mailSender(
      createdUser.email,
      "yourmail@website.com",
      "active  email",
      "Verifay your account",
      ` <a href="${require("./config/keys").endpoint}/activeemail?token=${
        newUser.activeEmailToken
      }">Verify accaount</a>`
    )
  );
  return res.redirect("/login");
});

/**
|--------------------------------------------------
| LOGIN
|--------------------------------------------------
*/

router.get("/login", async (req, res) => {
  res.render("pages/login", { active: true, noUser: false, validError: false });
});

router.post("/login", async (req, res, next) => {
  let { email, password } = req.body;
  // Validation request
  const valid = loginValiadtion.validate({ email, password });
  if (valid.error !== null) {
    return res.render("pages/login", {
      active: true,
      noUser: false,
      validError: true
    });
  }
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.render("pages/login", {
        active: true,
        noUser: true,
        validError: false
      });
    }
    if (!user.active) {
      res.render("pages/login", { active: false });
    }
    bcrypt.compare(password, user.password, (err, isValid) => {
      if (err) {
        return res.status(400).json({ error: "Password is wrong" });
      }
      if (isValid) {
        req.logIn(user, function(err) {
          return res.redirect("/");
        });
      }
    });
  });
});

/**
|--------------------------------------------------
| Activing email
|--------------------------------------------------
*/

router.get("/verifyemail/:activeToken", async (req, res) => {
  let user = await User.findOne({ activeToken: req.params.activeToken });
  if (user) {
    user.active = true;
    user.activeEmailToken = "";
    let newUser = await user.save();
    return res.status(200).json(newUser);
  }
  return res.staus(404).json({ err: "Not found" });
});

/**
|--------------------------------------------------
| Logout
|--------------------------------------------------
*/

router.get("/logout", async (req, res, next) => {
  req.logOut();
  res.redirect("/");
});

/**
|--------------------------------------------------
| Forgot password
|--------------------------------------------------
*/

router.get("/forgot-password", (req, res) => {
  res.render("pages/forgotPassword");
});

router.post("/forgot-password", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    user.resetPasswordToken = randomstring.generate(10);
    let newUser = await user.save();
    sgMail.send(
      mailSender(
        user.email,
        "youremai@website.com",
        "reset password",
        "Verifay your account",
        ` <a href="${require("./config/keys").endpoint}/reset-password?token=${
          newUser.resetPasswordToken
        }">reset passowrd</a>`
      )
    );
    return res.redirect("/");
  }
  return res.status(404).json({ err: "Not found" });
});

router.get("/reset-password/:token", async (req, res) => {
  let user = await User.findOne({ resetPasswordToken: req.params.token });

  if (user) {
    res.render("pages/resetPassword", { token: req.params.token });
  } else {
    res.redirect("/");
  }
});

router.post("/reset-password", async (req, res) => {
  const { password, password2, token } = req.body;
  if (password !== password2) {
    return res.status(400).json({ err: "password not match" });
  }
  let user = await User.findOne({ resetPasswordToken: token });
  if (user) {
    user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    user.resetPasswordToken = "";
    let newUser = await user.save();
    return res.redirect("/login");
  }
  return res.staus(404).json({ err: "Not found" });
});

module.exports = router;
