const User = require("../../models/User");

const router = require("express").Router();

//Get User by Id
router.get("/:userId?", async (req, res, next) => {
  if (req.params.userId) {
    const user = await User.findById({ _id: req.params.userId })
    .catch((e) => {
      return res.status(404).send("User not found");
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    return res.status(200).send({
      _id: user._id,
      fullname: user.fullname,
      username: user.username
    })
  } else {
    res.send(req.user)
  }
});

module.exports = router;