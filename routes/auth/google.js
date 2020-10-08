const passport = require("passport");
const router = require("express").Router();
var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "500217451301-54v07ievk66ddegq7jsbjlk66sis3m2h.apps.googleusercontent.com",
      clientSecret: "sUOaZ8TeQeEOKzYDSFgosGFd",
      callbackURL: "http://localhost:8080/",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(accessToken, refreshToken, profile);
      return cb({}, profile)
    }
  )
);

router.get("/", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.send("yes");
  }
);

module.exports = router;