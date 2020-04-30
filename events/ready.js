const config = require('../config')
const postStats = require("../index").postStats;

exports.run = async(client) => {

    console.log("Ready");
    postStats(client)
  
    client.user.setActivity(`${config.prefix}help | ${config.domain}` , {
        type: "PLAYING"
    });
    
};