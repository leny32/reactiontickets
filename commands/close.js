const Discord = require("discord.js");
const Tickets = require("../models/tickets");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    let ticket = await Tickets.findOne({
        channelID: message.channel.id
    });

    if (!ticket) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${reactions.prefix}${this.help.usage}\``);

    let panels = await Panels.findOne({
        guildID: message.guild.id,
        ticketType: ticket.ticketType
    });

    let channel = client.channels.cache.get(ticket.channelID);

    const logEmbed = new Discord.MessageEmbed()
        .setTitle(`Ticket ${ticket.ticket} | Closed`)
        .addField("Channel", `<#${ticket.channelID}> [${ticket.channelID}]`)
        .addField("Ticket Opener", `<@${ticket.userID}> [${ticket.userID}]`)
        .addField("Ticket Closer", `${message.author} [${message.author.id}]`)
        .setFooter(guild.footer)
    let logChannel = message.guild.channels.cache.get(panels.logID);
    if (logChannel) logChannel.send(logEmbed);

    await channel.messages.fetch(ticket.messageID).then(async (msg) => {
        let user = message.guild.members.cache.get(message.author.id);
        if (user.id !== client.user.id) {
            let ticketOwner = await client.users.fetch(ticket.userID);

            channel.updateOverwrite(ticket.userID, {
                VIEW_CHANNEL: false
            });

            channel.send(panels.closeMsg.replace('{executor}', message.author.tag).replace('{executorusername}', message.author.username).replace('{member}', ticketOwner.tag).replace('{username}', ticketOwner.username)).catch(err => { }).then(() => {
                const embed = new Discord.MessageEmbed()
                    .setTitle("Staff Tool")
                    .setDescription(`**Save transcript**: 📑
**Reopen ticket**: 🔓
**Delete ticket**: ⛔`)
                channel.send(embed).catch(err => { }).then(async (m) => {
                    await Tickets.findOne({
                        guildID: msg.guild.id,
                        channelID: msg.channel.id
                    }, async (err, ticket) => {
                        if (err) console.log(err);
                        ticket.active = false;
                        ticket.staffTool = m.id;
                        await ticket.save().catch(e => console.log(e));
                    });

                    m.react("📑").catch(err => { }).then(() => {
                        m.react("🔓").catch(err => { }).then(() => {
                            m.react("⛔").catch(err => { });
                        });
                    });
                });
            });
        };
    });
}

module.exports.help = {
    name: "close",
    aliases: ["c"],
    usage: "close [Must be Ticket Channel]",
    description: "Close a ticket",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}