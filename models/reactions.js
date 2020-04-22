const mongoose = require("mongoose");

const reactSchema = new mongoose.Schema({
    guildID: String,
    channelID: String,
    messageID: String,
    supportID: String,
    ticket: { type: Number, default: 0 },
    newTicket: { type: String, default: "You've opened a ticket." },
    prefix: { type: String, default: "rt!" },
    transcriptID: String
});

module.exports = mongoose.model("reactions", reactSchema);