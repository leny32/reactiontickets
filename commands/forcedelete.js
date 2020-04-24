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
    message.channel.send(reactions.forcedeleteMsg).then(() => {
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