const config = require('../config')

exports.run = async(client) => {

    console.log("Ready");
  
    client.user.setActivity(`${config.domain} | ${config.prefix}info` , {
        type: "PLAYING"
    });
    
};
