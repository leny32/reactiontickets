const mongoose = require("mongoose");

const reactSchema = new mongoose.Schema({
    guildID: String,
    channelID: String,
    messageID: String,
    userID: String,
    staffTool: String,
    active: { type: Boolean, default: true },
    ticket: Number
});

module.exports = mongoose.model("tickets", reactSchema);