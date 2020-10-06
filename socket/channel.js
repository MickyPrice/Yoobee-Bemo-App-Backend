const Channel = require("../models/Channel.js");
const User = require("../models/User.js");
const { getConnections } = require("../utils/socketConnections.js");

/**
 * Emit a channel update to socket
 * Sends a channel id and a channel data object
 *
 * @param { Object } socket - socket.io instance
 * @param { String } channel - channel id as string
 */

const updateChannel = async (io, channel) => {
  const channelData = await Channel.findOne(
    { _id: channel },
    { messages: 1, members: 1, updatedAt: 1 }
  );
  const members = channelData.members;
  await channelData
    .populate({
      path: "members",
      model: "User",
      select: "username fullname picture",
    })
    .execPopulate();

  if (channelData) {
    const currentMemebers = getConnections(members);
    console.log(currentMemebers)
    updateCurrentUsers(io, currentMemebers, channelData);
  }
};

/**
 * Emmit a channel to an array of socket id's
 *
 * @param { Object } io - socket.io instance
 * @param { Array } sockets - array of socket ids
 * @param { Object } channel - channel object to be emitted
 */

const updateCurrentUsers = (io, sockets, channel) => {
  sockets.forEach((socket) => {
    io.to(socket.socketId).emit("updateChannel", {
      id: channel._id,
      data: {
        length: channel.messages.length,
        latestMsg: channel.messages.slice(-1)[0],
        updatedAt: channel.updatedAt,
        members: Object.assign(
          {},
          ...channel.members.map((member) => ({
            [member._id]: {
              photo: member.photo,
              username: member.username,
              fullname: member.fullname,
            },
          }))
        ),
      },
    });
  });
};

/**
 * Updates users models, adding the new channel
 *
 * @param { Array } users
 * @param { Object } channel
 */
const updateUsers = (users, channel) => {
  users.forEach((user) => {
    User.findOne(user._id).then((user) => {
      user.channels.push(channel);
      user.save();
    });
  });
};

/**
 * Get a direct channel or if one dosent exsist create one
 *
 * @param { String } userId
 */
const getDirectChannel = async (io, socket, userId) => {
  const channel = await Channel.find({ members: { $all: [userId, socket.request.user._id] }, direct: true });

  if (channel.length == 0) {

    const newChannel = await new Channel({
      members: [userId, socket.request.user._id],
      direct: true,
    }).save();

    await User.updateMany({ _id: { $in: [socket.request.user._id, userId] } }, { "$push": { "channels": newChannel._id } });

    socket.emit("openChannel", newChannel._id);
  } else {
    socket.emit("openChannel", channel[0]._id);
  }
};

/**
 * Create new channel & update online users
 *
 * @param { Object } io - Socket.io instance
 * @param { Object } socket - Current socket connection
 * @param { Object } request - New channel object
 */
const createChannel = (io, socket, request) => {
  const channelSockets = getConnections(request.users);
  const channel = new Channel({ members: request.users });

  channel
    .save()
    .then((result) => {
      // Update Users
      updateUsers(request.users, result._id);

      // Update Online Users
      updateCurrentUsers(io, channelSockets, result);
    })
    .catch((err) => {
      io.to(socket).emit("error", { error: err });
    });
};

module.exports = {
  updateChannel,
  createChannel,
  getDirectChannel,
};
