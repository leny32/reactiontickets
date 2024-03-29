const Discord = require("discord.js");
const Reactions = require("../models/reactions");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    const embed = new Discord.MessageEmbed()
        .setTitle("Help | Prefix " + reactions.prefix)
        .setColor("GREEN")
        .addField("General", "``help``, ``premium``, ``claim``, ``invite``")
        .addField("Ticket", "``new``, ``close``, ``forceclose``, ``topic``")
        .addField("Configuration", "``setup``, ``prefix``, ``footer``, ``deletepanel``, ``listpanel``")
        .setFooter(reactions.footer)
    message.channel.send(embed).catch(err => { });
}

module.exports.help = {
    name: "help",
    aliases: ["info", "commands"],
    usage: "help command",
    description: "Help command",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
