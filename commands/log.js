const Discord = require("discord.js");
const Tickets = require("../models/tickets");
const Reactions = require("../models/reactions");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

        let reactions = Reactions.findOne({
            guildID: message.guild.id
        });

        let channelID;
        if (message.mentions.channels.first()) channelID = message.mentions.channels.first().id;
        else if (message.guild.channels.cache.get(args[0])) channelID = args[0];
        else return message.channel.send("Couldn't find channel.");

        if(reactions) {
            await Reactions.findOne({
                guildID: message.channel.id
            }, async (err, log) => {
                if (err) console.log(err);
                log.transcriptID = channelID;
                await log.save().catch(e => console.log(e));
            });

            message.channel.send("New log channel for transcripts, set.");
        }
}

module.exports.help = {
    name: "log",
    aliases: ["transcript"],
    usage: "log #channel",
    description: "Set a ticket transcript logging",
    perms: 3
};

module.exports.limits = {
    rateLimit: 3,
    cooldown: 5000
}