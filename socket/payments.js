const Payment = require("../../models/Payment.js");
const User = require("../../models/User.js");
const Transaction = require("../../models/Transaction.js");

const createPayment = (io, socket, channel) => {
  Channel.findOne(
    { _id: channel },
    { messages: { $slice: -1 }, members: 1 },
    (err, channelData) => {
      const currentMemebers = getConnections(channelData.members);
      updateCurrentUsers(io, currentMemebers, channelData);
    }
  );
};


// Create a payment
router.post("/", (req, res, next) => {
  const payment = new Payment(req.body);
  payment
    .save()
    .then((payment) => {
      return res.status(201).send(payment);
    })
    .catch(next);
});

// Confirm a payment
router.post("/confirm", (req, res, next) => {
  createTransaction(req.body.payment)
    .then((transaction) => {
      if (transaction.error) {
        return next(transaction.error);
      }

      return res.status(201).send(transaction);
    })
    .catch(next);
});

module.exports = router;
