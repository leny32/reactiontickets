const config = require('../config')

exports.run = async(client) => {

    console.log("Ready");
  
    client.user.setActivity(`${config.prefix}help | ${config.domain}` , {
        type: "PLAYING"
    });
    
};
