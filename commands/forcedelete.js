const Discord = require("discord.js");
const Tickets = require("../models/tickets");
const Reactions = require("../models/reactions");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    let ticket = await Tickets.findOne({
        channelID: message.channel.id
    });

    if (!ticket) return;

    if (reactions && !message.member.roles.cache.get(reactions.supportID)) return;

    const logEmbed = new Discord.MessageEmbed()
        .setTitle(`Ticket ${ticket.ticket} | Deleted (force)`)
        .addField("Channel", `[${ticket.channelID}]`)
        .addField("Ticket Opener", `<@${ticket.userID}> [${ticket.userID}]`)
        .addField("Deleted by", `${message.author} [${message.author.id}]`)
        .addField("Topic", ticket.ticketTopic)
        .setFooter(reactions.footer)
    let logChannel = message.guild.channels.cache.get(reactions.logID);
    if (logChannel) logChannel.send(logEmbed);

    let ticketOwner = message.guild.members.cache.get(ticket.userID);

    message.channel.send(reactions.forcedeleteMsg.replace('{executor}', message.author.tag).replace('{executorusername}', message.author.username).replace('{member}', ticketOwner.user.tag).replace('{username}', ticketOwner.user.username)).then(() => {
        message.channel.messages.fetch({ limit: 100 }).then(async (fetched) => {
            fetched = fetched.array().reverse();
            const mapped = fetched.map(m => `${m.author.tag}: ${m.content}`).join('\n');
            const att = new Discord.MessageAttachment(Buffer.from(mapped), `Transcript-${ticket.userID}.txt`);
            let logChannel = message.guild.channels.cache.get(reactions.logID);
            if (logChannel) logChannel.send(att);
        }).then(async () => {
            await Tickets.findOneAndDelete({
                channelID: message.channel.id
            });
            message.channel.delete();
        });
    })
}

module.exports.help = {
    name: "forcedelete",
    aliases: ["delete", "d"],
    usage: "delete",
    description: "Delete a ticket",
    perms: 2
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}