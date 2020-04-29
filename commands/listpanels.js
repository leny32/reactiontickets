const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    

    let panel = await Panels.find({
        guildID: message.guild.id
    });

    let panelEmbed = new Discord.MessageEmbed()
    .setTitle("Panel List")
    .setColor("GREEN")
    .setFooter(reactions.footer)

    for (let i = 0; i < panel.length; i++) {
        panelEmbed.addField(panel[i].ticketType,`**Ticket:** ${panel[i].ticket}\n**Channel**: ${message.guild.channels.cache.get(panel[i].channelID)}\n**Delete**: ${guild.prefix}dpanel ${panel[i].ticketType}`, true)
    }
    message.channel.send(panelEmbed)
}

module.exports.help = {
    name: "listpanels",
    aliases: ["listpanel", "lpanel", "list"],
    usage: "listpanels",
    description: "List all panels in current guild.",
    perms: 2
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
