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
        .setTitle("Support - Droplet")
        .setURL("https://discord.gg/r4ZAVRF")
        .setColor("GREEN")
        .setFooter(guild.footer)
        .addField("Support Server", `[Click to join](https://discord.gg/r4ZAVRF)`)

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
