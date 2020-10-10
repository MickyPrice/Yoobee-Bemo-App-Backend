const { getConnections } = require("../utils/socketConnections.js");
const { newMessage } = require("./chat.js");
const User = require("../models/User.js");
const Transaction = require("../models/Transaction.js");
const Payment = require("../models/Payment.js");
const mongoose = require("mongoose");
const socket = require("./index.js");
const Channel = require("../models/Channel.js");
const user = require("./user.js");

/**
 * 
 * @param {String} - An id to a payment in the database 
 * @param {*} sourceId - An id for the person the money is coming from
 */
const createTransaction = async (paymentId, currentUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findOne({
      _id: paymentId,
    }).session(session);

    if (!payment) { // Payment not found
      throw "Payment was not found";
    }
    if (payment.status !== "PENDING") { // Payment is not pending
      throw `This payment is not pending. Payment status is ${payment.status}.`;
    }
    if (payment.paymentType !== "BEMO") { // Unsupported payment type
      throw `Unsupported payment type: ${payment.paymentType}`;
    }

    // Create new trasnaction
    const transaction = await new Transaction({
      source: null,
      destination: null,
      status: null,
      payment: null,
      amount: payment.amount,
    });

    const source = await User.findOne({
      _id: payment.source,
    }).session(session);

    // If the source account doesn't exist
    if (!source) {
      throw "The provided source account is invalid";
    }

    if (JSON.stringify(source._id) !== JSON.stringify(currentUser._id)) {
      throw "You do not have permission to make fufill transactions on behalf of that user"
    }

    // Set the transaction source to a clone of the source in the payment
    transaction.source = source;

    // Get the destination user
    const destination = await User.findOne({
      _id: payment.destination,
    }).session(session);

    if (!destination) {
      throw "The provided destination account is invalid";
    }

    // Set the transaction destination to a clone of the destination in the payment
    transaction.destination = destination;


    // Ensure source has enough money to complete this transaction
    if (source.balance >= payment.amount) {
      destination.balance = destination.balance + payment.amount;
      source.balance = source.balance - payment.amount;
    } else {
      throw "Insufficient funds to perform this transaction";
    }

    payment.status = "RESOLVED";
    transaction.status = "RESOLVED";
    transaction.payment = payment;

    await source.save();
    await destination.save();
    await payment.save();
    await transaction.save();

    // Commit the current session
    await session.commitTransaction();

    return transaction;
  } catch (error) {
    // An error occurred
    await session.abortTransaction();
    return { error: error }
  } finally {
    // End the session
    session.endSession();
  }

};

/**
 *
 * @param {*} io
 * @param {*} socket
 * @param {*} request
 */

const createPayment = (io, socket, request, instantSend = false) => {
  if (
    (request.mode == "SEND" || request.mode == "REQUEST") && request.actor && !isNaN(request.amount)
  ) {
    const paymentObject = {
      source: request.mode == "SEND" ? socket.request.user._id : request.actor,
      destination: request.mode == "SEND" ? request.actor : socket.request.user._id,
      amount: request.amount,
      paymentType: "BEMO"
    };
    const payment = new Payment(paymentObject); // Generate a new payment in database
    payment.save() // Save said payment
      .then(async (payment) => { // SUCCESSFIULLY CREATED PAYMENT
        const payload = { // Payload to send over socket
          payment: payment._id,
          destination: payment.destination,
          source: payment.source
        }
        if (instantSend) { // Is it an instant fufill?
          if (socket.request.user._id == payment.source) {
            fufillPayment(socket, payload.payment);
          } else {
            // User doesn't have permission to send instant fufill from the source
            return socket.emit("bemoerror", "You don't have permission to send an instantly fufilling payment");
          }
        }
        
        
        const channel = await Channel.find({ members: { $all: [payment.destination, payment.source] }, direct: true });
        if (channel == 0) {
          // No channel found. Create one
          const newChannel = await new Channel({ members: [payment.destination, payment.source], direct: true }).save();
          await User.updateMany({ _id: { $in: [payment.destination, payment.source] } }, { "$push": { "channels": newChannel._id } });
          // TODO: Write to chat with payment
          return socket.emit("redirectToChat", { channel: newChannel._id });
        } else {
          // Channel found. Send them to it
          // TODO: Write to chat with payment
          return socket.emit("redirectToChat", { channel: channel[0]._id });
        }


        return socket.emit("paymentResponse", payload);
      })
      .catch((e) => { // FAILED TO SAVE
        return socket.emit("bemoerror", "Can't create payment: " + e);
      })
  } else {
    return socket.emit("bemoerror", "Can't create payment: Missing or incorrect data");
  }

}

const fufillPayment = (socket, paymentId) => {
  createTransaction(paymentId, socket.request.user)
    .then(async function (data) {
      if (!data.error) {
        return console.log(data)

        // return socket.emit("paymentFufilled", { callback: newChannel._id });

      } else {
        throw data.error;
      }
    })
    .catch(function (error) {
      // console.log(error);
      socket.emit("bemoerror", error);
    })

}


module.exports = {
  fufillPayment,
  createPayment,
};
