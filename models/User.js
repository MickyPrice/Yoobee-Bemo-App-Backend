const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    online: { type: Boolean, default: false },
    username: { type: String, required: true },
    fullname: { type: String, required: true },
    userToken: Number,
    pinCode: String,
    verified: Boolean,
    picture: String,
    balance: {
      type: Number,
      default: 0,
    },
    auth: String,
    accounts: Object,
    channels: [{ type: mongoose.Types.ObjectId, ref: "Channel" }],
    locked: {
      type: Boolean,
      default: false,
    },
    payments: [mongoose.Types.ObjectId],
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
