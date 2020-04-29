const Discord = require("discord.js");
const Tickets = require("../models/tickets");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    let ticket = await Tickets.findOne({
        channelID: message.channel.id
    });

    if (!ticket) return;

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    let panels = await Panels.findOne({
        guildID: message.guild.id,
        ticketType: ticket.ticketType
    });

    if (!panels && !panels.topic) return;

    const embed = new Discord.MessageEmbed()
    .setTitle("New Topic")
    .setDescription(args.slice(0).join(" ").substring(0, 256))
    .setFooter(reactions.footer);

    await Tickets.findOne({
        channelID: message.channel.id
    }, async (err, ticket) => {
        if (err) console.log(err);
        ticket.ticketTopic = args.slice(0).join(" ").substring(0, 256);
        ticket.save().catch(e => console.log(e));
        message.delete();
        message.channel.send(embed);
    });
}

module.exports.help = {
    name: "topic",
    aliases: ["changetopic", "t"],
    usage: "topic (newtopic)",
    description: "Change topic of a ticket.",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}