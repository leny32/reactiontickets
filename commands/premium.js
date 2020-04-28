const Discord = require("discord.js");
const Reactions = require("../models/reactions");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    const embed = new Discord.MessageEmbed()
    .setTitle("Premium")
    .setColor("ORANGE")
    .setDescription(`**Pricing**
    
    Premium can be bought for only $3/lifetime/per server
    
    Purchase at [droplet.gg](https://store.droplet.gg/reactiontickets/)`)
    .setFooter(reactions.footer)
    message.channel.send(embed);
}

module.exports.help = {
    name: "premium",
    aliases: ["pricing"],
    usage: "premium",
    description: "Gives a brief description on how to get premium.",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
