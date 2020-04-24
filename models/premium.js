const mongoose = require("mongoose");

const reactSchema = new mongoose.Schema({
    key: String,
    claimed: { type: Boolean, default: false }
});

module.exports = mongoose.model("premium", reactSchema);