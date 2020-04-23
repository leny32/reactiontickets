const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    let guildID = message.guild.id;

    let reactions = Reactions.findOne({
        guildID: guildID
    });

    let channel = client.channels.cache.get(reactions.channelID);
    let ticketMsg;
    if (channel) ticketMsg = await channel.messages.fetch(reactions.messageID);
    if (ticketMsg) {
        msg.delete()
        message.channel.send(`Previous ticket in <#${reactions.channelID}> has been deleted, because the setup command was issued.`).then(msg => {
            msg.delete(5000);
        });
    }

    message.channel.send("Please provide a channel ID or mention a channel where tickets can be opened.")
    .then(async () => {
        let messageID;
        let channelID;
        let channel;
        let supportID;
        let support;
        let logID;
        let dLog;
        let categoryID;
        let pingOnTicket;
        let filter = msg => {
            return msg.author.id === message.author.id
        };
        message.channel.awaitMessages(filter, { max: 1 })
        .then(ch => {
            const cha = ch.first();
            if (cha.mentions.channels.first()) channelID = cha.mentions.channels.first().id;
            else if (message.guild.channels.cache.get(cha.content)) channelID = cha.content;
            else return message.channel.send("Couldn't find channel.");
            channel = message.guild.channels.cache.get(channelID);
        }).then(() => {
            if (channelID) message.channel.send("Please provide a transcript log channel, id, or \"none\", if you don't want any.");
        }).then(async () => {
            if(channelID) message.channel.awaitMessages(filter, { max: 1 })
            .then(lo => {
                const log = lo.first();
                if (log.content == "none") logID = "none";
                else if (log.mentions.channels.first()) logID = log.mentions.channels.first().id;
                else if (message.guild.channels.cache.get(log.content)) logID = log.content;
                else return message.channel.send("Couldn't find channel.");
                dLog = message.guild.channels.cache.get(logID)
            }).then(() => {
                if(logID) message.channel.send("Please provide a category id or \"none\", if you don't want any.")
            }).then(async() => {
                if (logID) message.channel.awaitMessages(filter, { max: 1 })
                .then(ca => {
                    const cat = ca.first();
                    if (cat.content == "none") categoryID = "none";
                    else if (message.guild.channels.cache.get(cat.content)) categoryID = cat.content;
                    else return message.channel.send("Couldn't find category, or the specified \"none\".");
                }).then(() => {
                    if (categoryID) message.channel.send("Please provide a support role ID or mention a role.")
                }).then(async () => {
                    if (categoryID) message.channel.awaitMessages(filter, { max: 1 })
                    .then(su => {
                        const sup = su.first();
                        if (sup.mentions.roles.first()) supportID = sup.mentions.roles.first().id;
                        else if (message.guild.roles.cache.get(sup.content)) supportID = sup.content;
                        else return message.channel.send("Couldn't find role.");
                        support = message.guild.roles.cache.get(supportID);
                    }).then(() => {
                        if(supportID) message.channel.send(`Would you like ${support.name} to get pinged when a ticket is greated? (yes/no)`)
                        .then(async () => {
                            if (supportID) message.channel.awaitMessages(filter, { max: 1 })
                            .then(pi => {
                                const pin = pi.first();
                                if (pin.content == "yes" || pin.content == "y") pingOnTicket = true;
                                else if (pin.content == "no" || pin.content == "n") pingOnTicket = false;
                                else return pingOnTicket = false;
                            }).then(() => {
                                const embed = new Discord.MessageEmbed()
                                    .setTitle("Configuration")
                                    .setColor("GREEN")
                                    .setDescription(`Current configuration:`)
                                    .addField("Ticket Channel", channel, true)
                                    .addField("Support role", support, true)
                                    .addField("Transcript channel", dLog, true)
                                    .addField("Category ID", categoryID, true)
                                    .addField("Ping on Ticket", pingOnTicket, true)
                                    .setFooter("Powered by Reaction Tickets");
                                if (supportID) message.channel.send(embed).then(async () => {
                                    const embed = new Discord.MessageEmbed()
                                        .setTitle("Open Ticket")
                                        .setDescription("Please react with 🎫 below to open a ticket.")
                                        .setFooter("Reaction Tickets");
                                    await channel.send(embed).then(m => {
                                        messageID = m.id;
                                        m.react("🎫");
                                    });
        
                                    if (reactions) {
                                        await Reactions.findOne({
                                            guildID: guildID
                                        }, async (err, react) => {
                                            if (err) console.log(err);
                                            react.channelID = channelID;
                                            react.messageID = messageID;
                                            react.supportID = supportID;
                                            react.categoryID = categoryID;
                                            react.logID = logID;
                                            react.pingOnTicket = pingOnTicket;
                                            await react.save().catch(e => console.log(e));
                                        });
                            
                                    } else if (!reactions) {
                                        const newReaction = new Reactions({
                                            guildID: guildID,
                                            channelID: channelID,
                                            messageID: messageID,
                                            supportID: supportID,
                                            categoryID: categoryID,
                                            logID: logID,
                                            pingOnTicket: pingOnTicket
                                        });
                                        await newReaction.save().catch(e => console.log(e));
                                    };
                                });
                            });
                        });
                    })
                });
            });
        });
    });
};

module.exports.help = {
    name: "setup",
    aliases: ["s"],
    usage: "setup #channel @supportrole message",
    description: "Setup the bot",
    perms: 3
};

module.exports.limits = {
    rateLimit: 3,
    cooldown: 5000
}