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

    let panelOne = await Panels.findOne({
        guildID: message.guild.id,
        ticketType: args[0]
    });

    if (!args[0]) {
        let panelEmbed = new Discord.MessageEmbed()
            .setTitle("Panel List")
            .setColor("GREEN")
            .setFooter(reactions.footer)
        if (panel.length === "") panelEmbed.addField("No panels created.");
        for (let i = 0; i < panel.length; i++) {
            panelEmbed.addField(panel[i].ticketType, `**Name**: ${panel[i].ticketType}\n**Ticket:** ${panel[i].ticket}\n**Channel**: ${message.guild.channels.cache.get(panel[i].channelID)}\n**More**: ${guild.prefix}list ${panel[i].ticketType}`, true)
        }
        message.channel.send(panelEmbed).catch(err => { })
    } else if (panelOne) {
        let panelEmbed = new Discord.MessageEmbed()
            .setTitle(`Panel: ${panelOne.ticketType}`)
            .setColor("GREEN")
            .addField("Guild ID", panelOne.guildID, true)
            .addField("Message ID", panelOne.messageID, true)
            .addField("Support ID", panelOne.supportID, true)
            .addField("Category ID", panelOne.categoryID, true)
            .addField("Log ID", panelOne.logID, true)
            .addField("New Ticket Message", panelOne.newTicket, true)
            .addField("Close Message", panelOne.closeMsg, true)
            .addField("Reopen Message", panelOne.reopenMsg, true)
            .addField("Delete Message", panelOne.deleteMsg, true)
            .addField("Force Delete Message", panelOne.forcedeleteMsg, true)
            .addField("Topic", panelOne.topic, true)
            .addField("No DM", panelOne.noDMTicket, true)
            .addField("Ping on Ticket", panelOne.pingOnTicket, true)
            .addField("Name tickets", panelOne.nameTicket, true)
            .addField("Transcript on delete", panelOne.transcriptOnDelete, true)
        message.channel.send(panelEmbed);
    } else {
        return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${guild.prefix}${this.help.usage}\``);
    }
}

module.exports.help = {
    name: "listpanels",
    aliases: ["listpanel", "lpanel", "list"],
    usage: "listpanels <panel>",
    description: "List all panels in current guild.",
    perms: 2
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
