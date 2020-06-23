const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");
const config = require("../config")

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    let type = args.join(" ");
    if (!type) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${guild.prefix}${this.help.usage}\``)

    let panel = await Panels.findOne({
        guildID: message.guild.id,
        ticketType: type
    });

    if (!panel) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${guild.prefix}${this.help.usage}\``);

    let channel = message.guild.channels.cache.get(panel.channelID)

    if (channel) channel.messages.fetch(panel.messageID).then(msg => {
        msg.delete().catch(err => { });
    })

    await Panels.findOneAndDelete({
        guildID: message.guild.id,
        ticketType: type
    });
    message.channel.send("The panel was deleted.").catch(err => { })

}

module.exports.help = {
    name: "deletepanel",
    aliases: ["delpanel", "dpanel"],
    usage: "deletepanel (panel name)",
    description: "Delete a reaction panel",
    perms: 2
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
