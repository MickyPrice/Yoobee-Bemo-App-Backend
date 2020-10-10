const Channel = require("../models/Channel.js");
const User = require("../models/User.js");

/**
 * Returns a channel id for a direct message channel
 * 
 * @param { Object } socket - socket.io instance
 * @param { String } userId - User you want to get a channel for
 */
const directMessageChannel = async (socket, userId) => {
  const channel = await Channel.find({
    members: { $all: [userId, socket.request.user._id] },
    direct: true,
  });

  if (channel.length == 0) {
    const newChannel = await new Channel({
      members: [userId, socket.request.user._id],
      direct: true,
    }).save();

    await User.updateMany(
      { _id: { $in: [socket.request.user._id, userId] } },
      { $push: { channels: newChannel._id } }
    );

    return newChannel._id;
  } else {
    return channel[0]._id;
  }
};

/**
 * Send a new message to a channel
 * 
 * @param { Object } io - socket.io instance
 * @param { Object } socket - current socket
 * @param { String } channelId - channel id to send to
 * @param { Object } message - message object
 */
const sendMsg = async (io, socket, channelId, message) => {
  const channel = await Channel.findById(channelId);

  message.author = socket.request.user._id;
  message.createdAt = Date.now();

  // Save to database for current channel
  channel.messages.push(message);
  await channel.save();

  io.to(channelId).emit("receiveMsg", {
    msg: message,
    length: channel.messages.length,
  });
};

module.exports = {
    sendMsg,
    directMessageChannel
}