const User = require("../models/User.js");

let socketConnections = {};

const newConnection = (socket, user) => {
  socketConnections[user._id] = {
    socketId: socket,
    username: user.username,
    img: user.picture,
    _id: user.id
  };

  User.findOneAndUpdate({ _id: user.id }, { online: true }, {
    returnOriginal: false
  });
};

const destroyConnection = async (socket, user) => {
  await User.findOneAndUpdate({ _id: user }, { online: false }, {
    returnOriginal: false
  });

  delete socketConnections[user];
};

const getConnections = (ids) => {
  let connections = [];

  ids.forEach((user) => {
    console.log(user)
    if (socketConnections[user]) {
      connections.push(socketConnections[user]);
    }
  });

  return connections;
};

const getUsers = () => {
  return socketConnections;
};

module.exports = {
  newConnection,
  destroyConnection,
  getConnections,
  getUsers,
};
