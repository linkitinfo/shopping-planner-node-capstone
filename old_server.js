// const User = require("./models/user");
// const Link = require("./models/link");
// const bodyParser = require("body-parser");
// const config = require("./config");
// const mongoose = require("mongoose");
// const randomstring = require("randomstring");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const passport = require("passport");
// const BasicStrategy = require("passport-http").BasicStrategy;
// const express = require("express");
// const app = express();
// const session = require("express-session");
// const FileStore = require("session-file-store")(session);
// const FacebookStrategy = require("passport-facebook").Strategy;
// const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
// const LocalStrategy = require("passport-local").Strategy;
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(config.MAIL_KEY);
// app.set("view engine", "ejs");

// function mailSender({
//   to = "test@example.com",
//   from = "test@example.com",
//   subject = "Sending with SendGrid is Fun",
//   text = "and easy to do anywhere, even with Node.js",
//   html = "<strong>and easy to do anywhere, even with Node.js</strong>"
// }) {
//   const msg = {
//     to,
//     from,
//     subject,
//     text,
//     html
//   };
//   return msg;
// }
// // Validation
// const registerValiadtion = require("./validation/registerSchemaValiadtion");
// const loginValiadtion = require("./validation/loginSchemaValiadtion");
// app.use(bodyParser.json());
// app.use(cors());
// app.use(express.static("public"));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(
//   session({
//     secret: "hghtyNN23h",
//     store: new FileStore(),
//     cookie: {
//       path: "/",
//       httpOnly: true,
//       maxAge: 60 * 60 * 1000
//     },
//     resave: false,
//     saveUninitialized: false
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(function(user, done) {
//   console.log(user);
//   done(null, user);
// });

// passport.deserializeUser(function(user, done) {
//   done(null, user);
// });
// passport.use(
//   new LocalStrategy({ usernameField: "email" }, function(
//     email,
//     password,
//     done
//   ) {
//     if (email && password) {
//       return done(null, userDB);
//     } else {
//       return done(null, false);
//     }
//   })
// );

// mongoose.Promise = global.Promise;

// // ---------------- RUN/CLOSE SERVER -----------------------------------------------------
// let server = undefined;
// const authCheck = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     return res.redirect("/");
//   }
// };
// function runServer(urlToUse) {
//   return new Promise((resolve, reject) => {
//     mongoose.connect(
//       urlToUse,
//       err => {
//         if (err) {
//           return reject(err);
//         }
//         server = app
//           .listen(config.PORT, () => {
//             console.log(`Listening on localhost:${config.PORT}`);
//             resolve();
//           })
//           .on("error", err => {
//             mongoose.disconnect();
//             reject(err);
//           });
//       }
//     );
//   });
// }

// if (require.main === module) {
//   runServer(config.DATABASE_URL).catch(err => console.error(err));
// }

// function closeServer() {
//   return mongoose.disconnect().then(
//     () =>
//       new Promise((resolve, reject) => {
//         console.log("Closing server");
//         server.close(err => {
//           if (err) {
//             return reject(err);
//           }
//           resolve();
//         });
//       })
//   );
// }

// // ---------------USER ENDPOINTS-------------------------------------
// /**
//   // @route   POST /users/create
//   // @desc    Register user
//   // @access  Public
// **/
// app.post("/users/create", async (req, res) => {
//   let { name, email, phone, password } = req.body;
//   // Validation request
//   const valid = registerValiadtion.validate({ name, email, phone, password });
//   if (valid.error !== null) {
//     return res.status(400).json(valid.error);
//   }
//   //   Check user exist or not
//   let user = await User.findOne({ email });
//   if (user) {
//     return res.status(400).json({ error: "Email already exists" });
//   }
//   // Generating hashPassword
//   let hash = User.generateHash(password);
//   // Making activeToken
//   const activeEmailToken = randomstring.generate();
//   //   Creating new user
//   let newUser = new User({
//     name,
//     email,
//     phone,
//     password: hash,
//     activeEmailToken
//   });
//   const createdUser = await newUser.save();
//   sgMail.send(
//     mailSender(
//       "test@gmail.com",
//       createdUser.email,
//       "active  email",
//       "Verifay your account",
//       ` <a href="https://youwebstie.com/activeemail?token=${
//         newUser.activeEmailToken
//       }">Verify accaount</a>`
//     )
//   );
//   return res.status(201).json(createdUser);
// });

// /**
//   // @route   GET /verifyemail/:activeToken
//   // @desc    Verify activation email
//   // @access  Public
// **/
// app.get("/verifyemail/:activeToken", async (req, res) => {
//   let user = await User.findOne({ activeToken: req.params.activeToken });
//   if (user) {
//     user.active = true;
//     user.activeEmailToken = "";
//     let newUser = await user.save();
//     return res.status(200).json(newUser);
//   }
//   return res.staus(404).json({ err: "Not found" });
// });

// /**
//   // @route   GET /recover-passowrd/:activeToken
//   // @desc    Show reset password view
//   // @access  Public
// **/
// app.get("/recover-passowrd/:activeToken", async (req, res) => {
//   let user = await User.findOne({ activeToken: req.params.activeToken });
//   if (user) {
//     return res.status(200).json(user);
//   }
//   return res.staus(404).json({ err: "Not found" });
// });

// /**
//   // @route   POST /recover-passowrd/:activeToken
//   // @desc    Save new passsord
//   // @access  Public
// **/

// app.post("/recover-passowrd/:activeToken", async (req, res) => {
//   const { newPassword, newPassword2 } = req.body.body;
//   if (newPassword !== newPassword2) {
//     return res.status(400).json({ err: "password not match" });
//   }
//   let user = await User.findOne({ activeToken: req.params.activeToken });
//   if (user) {
//     user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null);
//     user.resetPasswordToken = "";
//     let newUser = await user.save();
//     return res.status(200).json(newUser);
//   }
//   return res.staus(404).json({ err: "Not found" });
// });

// /**
//   // @route   POST /recover-passowrd/:activeToken
//   // @desc    Send new email notifaction
//   // @access  Public
// **/

// app.get("/reset-password/:email", async (req, res) => {
//   let user = await User.findOne({ email: req.params.email });
//   if (user) {
//     user.resetPasswordToken = randomstring(10);
//     let newUser = await user.save();
//     sgMail.send(
//       mailSender(
//         "test@gmail.com",
//         user.email,
//         "reset password",
//         "Verifay your account",
//         ` <a href="https://youwebstie.com/activeemail?token=${
//           newUser.activeEmailToken
//         }">Verify accaount</a>`
//       )
//     );
//     return res.status(200).json(newUser);
//   }
//   return res.staus(404).json({ err: "Not found" });
// });

// /**
//   // @route   POST /users/signin
//   // @desc    Login user
//   // @access  Public
// **/

// app.post("/users/signin", async (req, res, next) => {
//   let { email, password } = req.body;
//   // Validation request
//   const valid = loginValiadtion.validate({ email, password });
//   if (valid.error !== null) {
//     return res.status(400).json(valid.error);
//   }
//   User.findOne({ email }).then(user => {
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     bcrypt.compare(password, user.password, (err, isValid) => {
//       if (err) {
//         return res.status(400).json({ error: "Password is wrong" });
//       }
//       if (isValid) {
//         req.logIn(user, function(err) {
//           return res.status(200).json(user);
//         });
//       }
//     });
//   });
// });

// // GOOGLE AUTH  //

// app.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: [
//       "https://www.googleapis.com/auth/plus.login",
//       "https://www.googleapis.com/auth/userinfo.email"
//     ]
//   })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   function(req, res) {
//     res.redirect("/");
//   }
// );

// //END GOOGLE AUTH  //

// // FACEBOOK AUTH //

// app.get("/auth/facebook", passport.authorize("facebook", { scope: ["email"] }));

// // Facebook will redirect the user to this URL after approval.  Finish the
// // authentication process by attempting to obtain an access token.  If
// // access was granted, the user will be logged in.  Otherwise,
// // authentication has failed.
// app.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", {
//     successRedirect: "/",
//     failureRedirect: "/login"
//   })
// );

// app.post("/link/create", (req, res) => {
//   let category = req.body.category;
//   let name = req.body.name;
//   let url = req.body.url;
//   let message = req.body.message;
//   let email = req.body.email;

//   Link.create(
//     {
//       category,
//       name,
//       url,
//       message,
//       email
//     },
//     (err, item) => {
//       if (err) {
//         return res.status(500).json({
//           message: "Internal Server Error"
//         });
//       }
//       if (item) {
//         return res.json(item);
//       }
//     }
//   );
// });

// // PUT --------------------------------------
// app.put("/link/:id", function(req, res) {
//   let toUpdate = {};
//   let updateableFields = ["category", "name", "url", "message", "email"];
//   updateableFields.forEach(function(field) {
//     if (field in req.body) {
//       toUpdate[field] = req.body[field];
//     }
//   });
//   Link.findByIdAndUpdate(req.params.id, {
//     $set: toUpdate
//   })
//     .exec()
//     .then(function(link) {
//       return res.status(204).end();
//     })
//     .catch(function(err) {
//       return res.status(500).json({
//         message: "Internal Server Error"
//       });
//     });
// });

// // GET ------------------------------------
// // accessing all of a user's achievements
// app.get("/link/:user", function(req, res) {
//   Link.find({
//     email: req.params.user
//   })
//     .then(function(links) {
//       res.json({
//         links
//       });
//     })
//     .catch(function(err) {
//       console.error(err);
//       res.status(500).json({
//         message: "Internal server error"
//       });
//     });
// });

// // DELETE ----------------------------------------
// // deleting an achievement by id
// app.delete("/delete-link/:id", function(req, res) {
//   Link.findByIdAndRemove(req.params.id)
//     .exec()
//     .then(function(link) {
//       return res.status(204).end();
//     })
//     .catch(function(err) {
//       return res.status(500).json({
//         message: "Internal Server Error"
//       });
//     });
// });

// app.get("/logout", function(req, res) {
//   req.logout();
//   res.redirect("/");
// });

// app.get("/test", (req, res) => {
//   res.render("pages/index");

//   console.log(req.isAuthenticated());
// });

// // MISC ------------------------------------------
// // catch-all endpoint if client makes request to non-existent endpoint
// app.use(express.static(__dirname + "/public"));

// app.use("*", (req, res) => {
//   res.status(404).json({
//     message: "Not Found"
//   });
// });

// // const ngrok = require("ngrok");
// // (async function() {
// //   const url = await ngrok.connect("8080");
// //   console.log(url);
// // })();

// exports.app = app;
// exports.runServer = runServer;
// exports.closeServer = closeServer;
