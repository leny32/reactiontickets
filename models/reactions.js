const mongoose = require("mongoose");

const reactSchema = new mongoose.Schema({
    guildID: String,
    channelID: String,
    messageID: String,
    supportID: String,
    categoryID: String,
    logID: String,
    ticket: { type: Number, default: 0 },
    prefix: { type: String, default: "rt!" },
    pingOnTicket: Boolean
});

module.exports = mongoose.model("reactions", reactSchema);