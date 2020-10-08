const { getConnections } = require("../utils/socketConnections.js");
const { newMessage } = require("./chat.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");
const socket = require("./index.js");

/**
 * 
 * @param {Object} io - SocketIo object
 * @param {Object} socket - Socket Object
 * @param {String} query - The query
 */
const getUsersBeginWith = (io, socket, query) => {
    query = query.replace(/\W/g, '');
    var regexp = new RegExp("^" + query, "i");
    User.find({ $or: [{ username: regexp }, { fullname: regexp }] }).then((data) => {
        let users = [];
        for (let i = 0; i < data.length; i++) {
            const dbuser = data[i];
            users.push({
                _id: dbuser._id,
                username: dbuser.username,
                fullname: dbuser.fullname
            });
        }
        socket.emit("userSearchResponse", users);
    }).catch((err) => {
        console.log("ERR", err);
    });
}
module.exports = {
    getUsersBeginWith
}