const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const config = require("../config");
const axios = require("axios");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    let key = args[0];
    if (!key) return message.reply("Please supply me with a valid key.")
    let reponse = await axios.post(`https://store.droplet.gg/api/checkKey/reactiontickets/${key}/${message.guild.id}/${message.author.id}`, {}, {
        headers: {
            'Authorization': `Bearer ${config.genKey}`
        }
    });
    if (!reponse) return message.reply("Some error occured, please contact droplet staff via the support server.");
    if (!reponse.data) return message.reply("Some error occured, please contact droplet staff via the support server.");
    let enabled = reponse.data.success;
    if (!enabled) return message.reply("This key does not exist or it is redeemed!").catch(err => { });

    const embed = new Discord.MessageEmbed()
    .setTitle("Premium has been activated")
    .setColor("GREEN")
    .setFooter(reactions.footer)
    message.channel.send(embed);
}

module.exports.help = {
    name: "claim",
    aliases: ["get", "redeem"],
    usage: "claim (key)",
    description: "Claim your premium key.",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
