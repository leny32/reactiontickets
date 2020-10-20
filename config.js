const dotenv = require("dotenv");

dotenv.config();

let config = {
    token: process.env.BOTTOKEN,
    mongodb: process.env.MONGODB,
    webhookAuth: process.env.WEBHOOKAUTH,
    dblToken: process.env.DBLTOKEN,
    domain: process.env.DOMAIN,
    apiUrl: process.env.APIURL,
    storeapi: process.env.STOREAPI,
    genKey: process.env.GENKEY,


    admins: ["506396083165855744", "561715927503339549", "395782478192836608"],
    prefix: process.env.PREFIX,
    missingperms: "Unauthorized action",
    wrongUsage: "Missing arguments in command, correct usage: "
}

module.exports = config;
