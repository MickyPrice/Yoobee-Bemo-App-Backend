const { getConnections } = require("../utils/socketConnections.js");
const { newMessage } = require("./chat.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");
const socket = require("./index.js");

const getUsersBeginWith = (io, socket, query) => {
    query = query.replace(/\W/g, '');
    var regexp = new RegExp("^" + query, "i");
    User.find({ $or: [{ username: regexp }, { fullname: regexp }] }).then((data) => {
        socket.emit("userSearchResponse", data);
    }).catch((err) => {
        console.log("ERR", err);
    });
}
module.exports = {
    getUsersBeginWith
}