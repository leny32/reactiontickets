const mongoose = require("mongoose");

const reactSchema = new mongoose.Schema({
    guildID: String,
    prefix: { type: String, default: "rt!" },
    footer: { type: String, default: "Powered by Reaction Tickets" }
});

module.exports = mongoose.model("reactions", reactSchema);