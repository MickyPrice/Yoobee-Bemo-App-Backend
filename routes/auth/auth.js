const { Mongoose } = require("mongoose");

const router = require("express").Router();

// Pin Codes
const pinRoute = require("./pin.js")
router.use("/pin", pinRoute);

module.exports = router;
