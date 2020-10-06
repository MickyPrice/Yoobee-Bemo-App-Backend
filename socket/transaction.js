const { getConnections } = require("../utils/socketConnections.js");
const { newMessage } = require("./chat.js");
const User = require("../models/User.js");
const Transaction = require("../models/Transaction.js");
const Payment = require("../models/Payment.js");
const mongoose = require("mongoose");
const socket = require("./index.js");

const createTransaction = async (paymentId, sourceId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get the current payment
    const payment = await Payment.findOne({
      _id: paymentId,
    }).session(session);

    if (!payment) {
      throw new Error("You must provide a vaild payment");
    }
    if (payment.status !== "PENDING") {
      throw new Error(`This payment has ${payment.status}`);
    }
    if (payment.paymentType !== "BEMO") {
      throw new Error("This payment is not a Bemo acc to acc transaction.");
    }

    const transaction = await new Transaction({
      source: null,
      destination: null,
      status: null,
      payment: null,
      amount: payment.amount,
    });

    // Get the current users most uptodate balance
    const source = await User.findOne({
      _id: sourceId,
    }).session(session);

    // If the user account dosent exist throw an error
    if (!source) {
      throw new Error("You must be logged in to perform this action");
    }

    transaction.source = source;

    // Update the users balance
    source.balance = source.balance - payment.amount;

    // Save the updated source into the session
    await source.save();

    // Get the destination user
    const destination = await User.findOne({
      _id: payment.destination,
    }).session(session);

    if (!destination) {
      throw new Error("The provided destination account is invalid");
    }

    transaction.destination = destination;

    // Update the destination user's balance
    if (source.balance >= payment.amount) {
      destination.balance = destination.balance + payment.amount;
      source.balance = source.balance - payment.amount;
    } else {
      throw new Error("You have insufficient funds to complete this transaction");
    }

    // Save the updated destination
    await destination.save();

    payment.status = "RESOLVED";
    await payment.save();

    transaction.status = "RESOLVED";
    transaction.payment = payment;
    await transaction.save();

    // Commit the current session
    await session.commitTransaction();

    return transaction;
  } catch (error) {
    // Abort the transaction
    await session.abortTransaction();
    return {
      error: error,
    };
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
const createPayment = (io, socket, request) => {

  if (
    (request.mode == "SEND" || request.mode == "REQUEST") && request.actor && !isNaN(request.amount)
  ) {
    const paymentObject = {
      source: request.mode == "SEND" ? socket.request.user._id : request.actor,
      destination: request.mode == "SEND" ? request.actor : socket.request.user._id,
      amount: request.amount,
      paymentType: "BEMO"
    };
    const payment = new Payment(paymentObject);
    payment
      .save()
      .then((data) => {
        // TODO: Send messages to appropriate channels
        console.log(data);
        return socket.emit("paymentResponse", data._id);
      })
  } else {
    console.error("Missing data");
  }
};

/**
 *
 * @param {*} io
 * @param {*} socket
 * @param {*} request
 */
const fufillPayment = (io, socket, request) => {
  createTransaction(request.payment, socket.request.user._id)
    .then((data) => {
      if (!data.error) {
        console.log("DATA", data);
      } else {
        console.log("ERROR", data.error)
      }
    });
  // console.log(request.payment);
};

module.exports = {
  fufillPayment,
  createPayment,
};
