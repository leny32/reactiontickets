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

    let channel = client.channels.cache.get(ticket.channelID);
    await channel.messages.fetch(ticket.messageID).then(async (msg) => {
        let user = message.guild.members.cache.get(message.author.id);
        if (user.id !== client.user.id) {
            let memberObj = message.guild.members.cache.get(ticket.id);

            channel.updateOverwrite(ticket.id, {
                VIEW_CHANNEL: false
            });

            let reactions = await Reactions.findOne({
                guildID: msg.guild.id
            });

            channel.send(reactions.closeMsg.replace('{member}', memberObj.user.tag).replace('{username}', memberObj.user.username)).then(()=> {
                const embed = new Discord.MessageEmbed()
                    .setTitle("Staff Tool")
                    .setDescription(`**Save transcript**: 📑
**Reopen ticket**: 🔓
**Delete ticket**: ⛔`)
                channel.send(embed).then(async (m) => {
                    await Tickets.findOne({
                        guildID: msg.guild.id,
                        channelID: msg.channel.id
                    }, async (err, ticket) => {
                        if (err) console.log(err);
                        ticket.active = false;
                        ticket.staffTool = m.id;
                        await ticket.save().catch(e => console.log(e));
                    });

                    m.react("📑").then(() => {
                        m.react("🔓").then(() => {
                            m.react("⛔");
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
    usage: "close",
    description: "Close a ticket",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}