const express = require('express');
const app = express();
const passport = require('passport');
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// App Configuration
app.use(express.static('public'));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
dotenv.config();

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});



// Auth Routes
const authRoute = require("./routes/auth/auth.js")
app.use("/auth", authRoute);

// Server Listener
app.listen(3000, () => { 
  console.log("Listening on port 3000...");
});

