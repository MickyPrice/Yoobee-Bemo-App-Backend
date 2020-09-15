const { Mongoose } = require("mongoose");
const passport = require("passport");
const CustomStrategy = require("passport-custom");
const router = require("express").Router();

const crypto = require('crypto');

router.use("/", function(req, res, next) {
  if (req.method != "POST") {
    res.send("Method not allowed").status(405);
  }
  next();
});


passport.use("pin", new CustomStrategy(
  (req, done) => {
    // TODO: Check database & compare username and PIN. If successfull, continue, if not, error. 

    let user = false;
    let error = null;

    if (req.body.userId && req.body.pin) {
      const userId = req.body.userId;
      const pin = req.body.pin;
      const encryptedPin = crypto.createHash("sha256").update(pin).digest("base64"); // Encrypted version of pin code user sent
      const validEncryptedPin = crypto.createHash("sha256").update("1234").digest("base64");

      console.log(encryptedPin);

      if (validEncryptedPin === encryptedPin) {
        user = {username: "Jim"}
      } else {
        error = {
          status: 401, 
          error: "That PIN code is incorrect",
          response: null
        }
      }
    } else {
      error = {
        status: 400, 
        error: "Invalid Request",
        response: null
      }
    }
    return done(error, user);
  }
));



router.post("/", function(req, res, next) {
  passport.authenticate("pin", function(err, user, info) {
    if (err) {
      console.log(err);
      
      return next(err);
    }
    if (!user) {
      return res.send("Missing User").status(400);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log(info);
      return res.send("Login success").status(200);
    })
  })(req,res,next);
});

module.exports = router;