const mongoose = require("mongoose");

const reactSchema = new mongoose.Schema({
    guildID: String,
    channelID: String,
    messageID: String,
    supportID: String,
    categoryID: String,
    logID: String,
    prefix: { type: String, default: "rt!" },
    footer: { type: String, default: "Powered by Reaction Tickets"},
    newTicket: { type: String, default: "You've opened a ticket, react below to close it."},
    closeMsg: { type: String, default: "The ticket was closed by {member}" },
    reopenMsg: { type: String, default: "The ticket was reopened by {member}" },
    deleteMsg: { type: String, default: "The ticket was deleted by {member}" },
    forcedeleteMsg: { type: String, default: "The ticket was forcefully deleted by {member}" },
    ticket: { type: Number, default: 0 },
    premium: { type: Boolean, default: false },
    pingOnTicket: { type: Boolean, default: false }
});

module.exports = mongoose.model("reactions", reactSchema);