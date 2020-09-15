const { Mongoose } = require("mongoose");
const passport = require("passport");
const CustomStrategy = require("passport-custom");

const router = require("express").Router();

passport.use('pin', new CustomStrategy(
    function(req, callback) {
      // Do your custom user finding logic here, or set to false based on req object
      callback(null, user);
    }
));


router.post("/", (req, res, next) => {    
    passport.authenticate('pin', { failureRedirect: '/fail' }),
    function(req, res) {
      res.redirect('/success');
    }
});

module.exports = router;