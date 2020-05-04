const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const axios = require("axios")
exports.run = async (client, guild, message, args) => {

    let infomation = await axios.post("https://droplet.gg/reactiontickets/api/getStats", { bot: "reactionticket" }, {
        headers: {
            'Authorization': `Bearer +raY,*RdtoQ9=*,!Dd0*qg*BB+euWBWmmJ,LZkb*nX!tnEv3r=t(1;sbN?I13D.Hs.8%i3PI2*yKS1Z:`
        }
    });
    let info = infomation.data;
    const embedStats = new Discord.MessageEmbed()
        .setTitle("Reaction Tickets - Statistics")
        .setColor("GREEN")
        .setFooter(guild.footer)
        .addField("• Ram Usage", `${info.ram}GB`)
        .addField("• Users", info.members)
        .addField("• Servers", info.servers)
        .addField("• Channels", info.channels)
        .addField("• API Latency", `${Math.round(client.ws.ping)} ms`)
        .addField("• Shard ID", message.guild.shardID)

    message.channel.send({ embed: embedStats }).catch(err => { });
}

module.exports.help = {
    name: "support",
    aliases: ["supportserver"],
    usage: "support",
    description: "Join the support server",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
