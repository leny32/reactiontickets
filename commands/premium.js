const Discord = require("discord.js");
const Reactions = require("../models/reactions");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    const embed = new Discord.MessageEmbed()
        .setTitle("Premium")
        .setColor("ORANGE")
        .setDescription(`**Features**
- Custom prefix
- Custom footer message
- Choose advanced or simple setup
- Custom new ticket message
- Custom open ticket message
- Custom close ticket message
- Custom reopen ticket message
- Custom delete ticket message
- Custom force delete ticket message
- Ping on ticket creation (on/off)
- Name tickets (on/off)
- Transcript on delete (on/off)
- No DM on delete (on/off)
+ more on it's way
    
**Pricing**
Premium can be bought for only $5/lifetime
    
Purchase at [droplet.gg](https://store.droplet.gg/reactiontickets/)`)
        .setFooter(reactions.footer)
    message.channel.send(embed).catch(err => { })
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
