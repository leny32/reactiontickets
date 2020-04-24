const Discord = require("discord.js");
const Reactions = require("../models/reactions");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    const embed = new Discord.MessageEmbed()
    .setTitle("Help | Prefix " + reactions.prefix)
    .addField("General", "``help``, ``premium``, ``claim``")
    .addField("Ticket", "``close``, ``forcedelete``")
    .addField("Configuration", "``setup``, ``prefix``")
    .setFooter(reactions.footer)
    message.channel.send(embed);
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
