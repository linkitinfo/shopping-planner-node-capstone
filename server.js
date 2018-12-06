const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const LocalStrategy = require("passport-local").Strategy;

const cors = require("cors");
const app = express();

/**
|--------------------------------------------------
| Mongoose models
|--------------------------------------------------
*/

const User = require("./models/user");

// End of models

/**
|--------------------------------------------------
| Auth routes
|--------------------------------------------------
*/

const auth = require("./routes/auth");
const socialauth = require("./routes/socialauth");

const db = require("./config/keys").mongoURI;

// End keys

/**
|--------------------------------------------------
| Middlewares
|--------------------------------------------------
*/
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.set("view engine", "ejs");
app.set("trust proxy", 1); // trust first proxy

app.use(
  session({
    secret: "hghtyNN23h",
    store: new FileStore(),
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    },
    resave: false,
    saveUninitialized: false
  })
);
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, function(
    email,
    password,
    done
  ) {
    if (email && password) {
      return done(null, userDB);
    } else {
      return done(null, false);
    }
  })
);

app.use(function(req, res, next) {
  res.locals = {
    user: req.user ? req.user : {},
    isAuthenticated: req.isAuthenticated()
  };
  next();
});

// End of middlewares

/**
|--------------------------------------------------
| Database Connection
|--------------------------------------------------
*/
mongoose.Promise = global.Promise;

mongoose
  .connect(
    db,
    { useMongoClient: true }
  )
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// End of db connection
app.get("/", (req, res) => {
  console.log(req.isAuthenticated());
  // console.log(req.user.name);
  // console.log(req.user);
  res.render("pages/index");
});

/**
|--------------------------------------------------
|  ROTUTES
|--------------------------------------------------
*/

app.use("/", auth);
app.use("/", socialauth);
// routes.initialize(app);

app.use(express.static(__dirname + "/public"));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
