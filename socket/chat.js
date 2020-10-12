const Channel = require("../models/Channel.js");
const { updateChannel } = require("./channel.js");
const { sendMsg } = require("../utils/message.js");

/**
 * Create and save a new message
 * Then emmit that message to that channel
 *
 * @param { Object } socket - socket.io instance
 * @param { Object } request - request body object
 * @typedef {{ channel: objectId, content: string, contentType: string }}
 */

const newMessage = async (io, socket, request) => {
  await sendMsg(io, socket, request.channel, request.message);
  updateChannel(io, request.channel);
};

const getMsgs = async (socket, options) => {
  const channel = await Channel.findById(options.channelId);
  const msgSum = await channel.messages.length
  const messages = channel.messages.splice(- options.num -20 , 20).reverse();
  socket.emit("reciveMsgs", {
    msgs: messages, 
    length: msgSum
})};

module.exports = {
  newMessage,
  getMsgs
};
