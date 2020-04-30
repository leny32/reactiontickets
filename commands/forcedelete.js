const Discord = require("discord.js");
const Tickets = require("../models/tickets");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });
    let ticket = await Tickets.findOne({
        channelID: message.channel.id
    });

    if (!ticket) return;

    let panels = await Panels.findOne({
        guildID: message.guild.id,
        ticketType: ticket.ticketType
    });

    if (panels && !message.member.roles.cache.get(panels.supportID)) return;

    const logEmbed = new Discord.MessageEmbed()
        .setTitle(`Ticket ${ticket.ticket} | Deleted (force)`)
        .addField("Channel", `[${ticket.channelID}]`)
        .addField("Ticket Opener", `<@${ticket.userID}> [${ticket.userID}]`)
        .addField("Deleted by", `${message.author} [${message.author.id}]`)
        .setFooter(reactions.footer)
        if (panels.topic) logEmbed.addField("Topic", ticket.ticketTopic)
    let logChannel = message.guild.channels.cache.get(panels.logID);
    if (logChannel) logChannel.send(logEmbed).catch(err => { });

    let ticketOwner = await client.users.fetch(ticket.userID);

    message.channel.send(panels.forcedeleteMsg.replace('{executor}', message.author.tag).replace('{executorusername}', message.author.username).replace('{member}', ticketOwner.tag).replace('{username}', ticketOwner.username)).catch(err => { }).then(() => {
        message.channel.messages.fetch({ limit: 100 }).catch(err => { }).then(async (fetched) => {
            fetched = fetched.array().reverse();
            if (panels.transcriptOnDelete) {
                const mapped = fetched.map(m => `${m.author.tag}: ${m.content}`).join('\n');
                const att = new Discord.MessageAttachment(Buffer.from(mapped), `Transcript-${ticket.userID}.txt`);
                let logChannel = message.guild.channels.cache.get(panels.logID);
                if (logChannel) logChannel.send(att).catch(err => { });
            }
        }).then(async () => {
            await Tickets.findOneAndDelete({
                channelID: message.channel.id
            });
            message.channel.delete().catch(err => { });
        });
    })
}

module.exports.help = {
    name: "forcedelete",
    aliases: ["tdelete", "fd"],
    usage: "delete",
    description: "Delete a ticket",
    perms: 2
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}