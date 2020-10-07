let socketConnections = {};

const newConnection = (socket, user) => {
  socketConnections[user._id] = {
    socketId: socket,
    username: user.username,
    img: user.picture,
    _id: user.id
  };
};

const destroyConnection = (socket) => {
  delete socketConnections[socket];
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
