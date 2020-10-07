/**
 * Send the current user thier channels, user info
 * and other application data
 *
 * @param { object } socket - socket.io instance
 */

const init = async (socket) => {
  const chatsPayload = {};

  if (socket.request.user.channels) {
    // populate the current user's channels and into thoes channels thier members
    await socket.request.user
      .populate({
        path: "channels",
        model: "Channel",
        select: {
          messages: 1,
          members: 1,
          updatedAt: 1,
        },
        populate: {
          path: "members",
          model: "User",
          select: "username fullname picture",
        },
      })
      .execPopulate();

    // For each channel return a dictonary of channels
    for (id in socket.request.user.channels) {
      if (socket.request.user.channels[id].messages.length !== 0) {
        let channelMembers = socket.request.user.channels[id].members;
        chatsPayload[socket.request.user.channels[id]._id] = {
          // Get them channels latest message
          length: socket.request.user.channels[id].messages.length,
          latestMsg: socket.request.user.channels[id].messages.slice(-1)[0],
          // Reassign the channel members to objects for the frontend
          updatedAt: socket.request.user.channels[id].updatedAt,
          members: Object.assign(
            {},
            ...channelMembers.map((member) => ({
              [member._id]: {
                photo: member.photo,
                username: member.username,
                fullname: member.fullname,
              },
            }))
          ),
        };
      }
    }
  }

  // Emmit the channels dictonary and user info to the current user
  socket.emit("initChannels", chatsPayload);
  socket.emit("initUser", socket.request.user);
};

module.exports = {
  init,
};
