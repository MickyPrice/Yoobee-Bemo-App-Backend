// Socket.io
const Channel = require("../models/Channel.js");
const { init } = require("./init.js");
const { createChannel, getDirectChannel } = require("./channel.js");
const { newMessage, getMsgs } = require("./chat.js");

const {
  newConnection,
  destroyConnection,
  getUsers,
} = require("../utils/socketConnections.js");
const { fufillPayment, createPayment } = require("./transaction.js");
const { getUsersBeginWith } = require("./user.js");

const socket = (io) => {
  io.on("connection", async (socket) => {
    newConnection(socket.id, socket.request.user);
    io.emit("activeUsers", getUsers());

    /**
     * Init to the new socket with the users application data
     */

    init(socket);

    socket.on("init", () => {
      init(socket);
    });

    /**
     * Listster for a socket creatChannel event
     *
     * @param  {object} request - new channel object
     * @typedef {{ name: string, users: array}}
     */

    socket.on("createChannel", (request) => {
      createChannel(io, socket, request);
    });

    socket.on("getDirectChannel", (request) => {
      getDirectChannel(io, socket, request);
    });

    /**
     * Listen for a socket chatMessage event
     *
     * @param {object} request - chat message object
     * @typedef {{ channel: objectId, content: string, contentType: string}}
     */

    socket.on("sendMsg", (request) => {
      newMessage(io, socket, request);
    });

    /**
     * Listen for a socket joinChanel event
     *
     * @param { String } channel - The channel id
     */

    socket.on("joinChannel", async (channelId) => {
      socket.join(channelId);
    });

    socket.on("getMsgs", (options) => {
      getMsgs(socket, options);
    })

    /**
     * Listen for a socket fufillRequest event
     *
     * @param {object} request - payment fufillment request
     * @typedef {{ channel: objectId, content: string, contentType: string}}
     */

    socket.on("fufillRequest", (request) => {
      fufillPayment(io, socket, request);
    });

    /**
     * Listen for a socket payment event
     *
     * @param {object} request
     */

    socket.on("payment", (request) => {
      createPayment(io, socket, request);
    });

    /**
     * Listen for a socket instantPayment event (a payment from the source that will be paid instantly)
     *
     * @param {object} request 
     */

    socket.on("instantPayment", (request) => {
      createPayment(io, socket, request, true);
    });

    /**
     * Listen for a socket searchUser event
     *
     * @param {object} request - Search query
     */

    socket.on("searchUser", (query) => {
      getUsersBeginWith(io, socket, query);
    });

    /**
     * Listen for a socket leaveChannel event
     *
     * @param { String } channel - The channel id
     */

    socket.on("leaveChannel", (channel) => {
      // console.log("User Left " + channel);
      socket.leave(channel);
    });

    /**
     * When a user disconnects from socket
     */

    socket.on("disconnect", () => {
      destroyConnection(socket._id, socket.request.user._id);
    });
  });
};

module.exports = socket;
