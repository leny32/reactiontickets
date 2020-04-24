const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    let guildID = message.guild.id;

    let reactions = await Reactions.findOne({
        guildID: guildID
    });

    let channel = client.channels.cache.get(reactions.channelID);
    let ticketMsg;
    try {
        if (channel) ticketMsg = await channel.messages.fetch(reactions.messageID);
        if (ticketMsg) {
            ticketMsg.delete()
            message.channel.send(`Previous ticket in <#${reactions.channelID}> has been deleted, because the setup command was issued.`);
        }
    } catch {
        
    }

    let messageID;
    let channelID;
    let supportID;
    let support;
    let logID;
    let dLog;
    let categoryID;
    let openTicket;
    let newTicket;
    let footer;
    let closeMsg;
    let reopenMsg;
    let deleteMsg;
    let forcedeleteMsg;
    let premium = reactions.premium;
    let pingOnTicket;


    const embed = new Discord.MessageEmbed()
        embed.setTitle("Configuration")
        embed.setColor("ORANGE")
        embed.setDescription(`Current configuration:`)
    message.channel.send(embed).then(embe => {

        message.channel.send("Please provide a channel ID or mention a channel where tickets can be opened.")
        .then(async (tsg) => {
            let filter = msg => {
                return msg.author.id === message.author.id
            };
            message.channel.awaitMessages(filter, { max: 1 })
            .then(res => {
                const response = res.first();
                if (response.mentions.channels.first()) channelID = response.mentions.channels.first().id;
                else if (message.guild.channels.cache.get(response.content)) channelID = response.content;
                else { 
                    embed.setTitle("Cancelled")
                    embed.setColor("RED")
                    embe.edit(embed);
                    return message.channel.send("Couldn't find channel.");
                }
                channel = message.guild.channels.cache.get(channelID);
                embed.addField("Ticket Channel", channel, true);
                embe.edit(embed);
                response.delete();
                tsg.delete();
            }).then(() => {
                if (channelID) message.channel.send("Please provide a transcript log channel, id, or \"none\", if you don't want any.")
                .then(async (tsg) => {
                    if(channelID) message.channel.awaitMessages(filter, { max: 1 })
                    .then(res => {
                        const response = res.first();
                        if (response.content == "none") { 
                            logID = "none"
                            dLog = "none"
                        }
                        else if (response.mentions.channels.first()) logID = response.mentions.channels.first().id;
                        else if (message.guild.channels.cache.get(log.content)) logID = response.content;
                        else { 
                            embed.setTitle("Cancelled")
                            embed.setColor("RED")
                            embe.edit(embed);
                            return message.channel.send("Couldn't find channel.");
                        }
                        embed.addField("Transcript channel", dLog, true);
                        embe.edit(embed);
                        response.delete();
                        tsg.delete();
                    }).then(() => {
                        if(logID) message.channel.send("Please provide a category id for where tickets should be placed or \"none\", if you don't want any.")
                        .then(async(tsg) => {
                            if (logID) message.channel.awaitMessages(filter, { max: 1 })
                            .then(res => {
                             const response = res.first();
                                if (response.content == "none") categoryID = "none";
                                else if (message.guild.channels.cache.get(response.content)) categoryID = response.content;
                                else { 
                                    embed.setTitle("Cancelled")
                                    embed.setColor("RED")
                                    embe.edit(embed);
                                    return message.channel.send("Couldn't find category, or the specified \"none\".");
                                }
                                embed.addField("Category ID", categoryID, true);
                                embe.edit(embed);
                                response.delete();
                                tsg.delete();
                             }).then(() => {
                                if (categoryID) message.channel.send("Please provide a support role ID or mention a role, which will get access to tickets.")
                                .then(async (tsg) => {
                                    if (categoryID) message.channel.awaitMessages(filter, { max: 1 })
                                    .then(res => {
                                        const response = res.first();
                                        if (response.mentions.roles.first()) supportID = response.mentions.roles.first().id;
                                        else if (message.guild.roles.cache.get(response.content)) supportID = response.content;
                                        else { 
                                            embed.setTitle("Cancelled")
                                            embed.setColor("RED")
                                            embe.edit(embed);
                                            return message.channel.send("Couldn't find role.");
                                        }
                                        support = message.guild.roles.cache.get(supportID);
                                        embed.addField("Support role", support, true);
                                        embe.edit(embed);
                                        response.delete();
                                        tsg.delete();
                                     }).then(() => {
                                        if(premium) {
                                            if(supportID) message.channel.send(`Would you like ${support.name} to get pinged when a ticket is greated? (yes/no)`)
                                            .then(async (tsg) => {
                                                if (supportID) message.channel.awaitMessages(filter, { max: 1 })
                                                .then(res => {
                                                    const response = res.first();
                                                    if (response.content == "yes" || response.content == "y") pingOnTicket = true;
                                                    else if (response.content == "no" || response.content == "n") pingOnTicket = false;
                                                    else pingOnTicket = false;
                                                    embed.addField("Ping on ticket", pingOnTicket, true);
                                                    embe.edit(embed);
                                                    response.delete();
                                                    tsg.delete();
                                                }).then(() => {
                                                    message.channel.send(`What message would you like to send in ${channel}? (default/message)`)
                                                    .then(async (tsg) => {
                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                        .then(res => {
                                                            const response = res.first();
                                                            if (response.content == "default") openTicket = "You've opened a ticket, react below to close it.";
                                                            else if (response.content) openTicket = response.content
                                                            else openTicket = "React below to open a ticket."
                                                            embed.addField("Open ticket", openTicket, true);
                                                            embe.edit(embed);
                                                            response.delete();
                                                            tsg.delete();
                                                        }).then(() => {
                                                            message.channel.send("What message would you like to be sent when new tickets are opened? (default/message)")
                                                            .then(async (tsg) => {
                                                                message.channel.awaitMessages(filter, { max: 1 })
                                                                .then(res => {
                                                                    const response = res.first();
                                                                    if (response.content == "default") newTicket = "You've opened a ticket, react below to close it.";
                                                                    else if (response.content) newTicket = response.content;
                                                                    else newTicket = "You've opened a ticket, react below to close it.";
                                                                    embed.addField("New ticket", newTicket, true);
                                                                    embe.edit(embed);
                                                                    response.delete();
                                                                    tsg.delete();
                                                                }).then(() => {
                                                                    message.channel.send("What would you like to be in the footer of all messages? (default/message)")
                                                                    .then(async (tsg) => {
                                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                                        .then(res => {
                                                                            const response = res.first();
                                                                            if (response.content == "default") footer = "Powered by Reaction Tickets";
                                                                            else if (response.content) footer = response.content;
                                                                            else footer = "Powered by Reaction Tickets";
                                                                            embed.setFooter(footer);
                                                                            embe.edit(embed);
                                                                            response.delete();
                                                                            tsg.delete();
                                                                        }).then(() => {
                                                                            message.channel.send(`What would you like the **close** ticket message to be? (default/message)
                                                        
{member} = Username + discriminator
{username} = Username`)
                                                                            .then(async (tsg) => {
                                                                                message.channel.awaitMessages(filter, { max: 1 })
                                                                                .then(res => {
                                                                                    const response = res.first();
                                                                                    if (response.content == "default") closeMsg = "The ticket was closed by {member}";
                                                                                    else if (response.content) closeMsg = response.content;
                                                                                    else closeMsg = "The ticket was closed by {member}";
                                                                                    embed.addField("Ticket closed", closeMsg, true);
                                                                                    embe.edit(embed);
                                                                                    response.delete();
                                                                                    tsg.delete();
                                                                                }).then(() => {
                                                                                    message.channel.send(`What would you like the **reopen** ticket message to be? (default/message)
                                                        
{member} = Username + discriminator
{username} = Username`)
                                                                                    .then(async (tsg) => {
                                                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                                                        .then(res => {
                                                                                            const response = res.first();
                                                                                            if (response.content == "default") reopenMsg = "The ticket was reopened by {member}";
                                                                                            else if (response.content) reopenMsg = response.content;
                                                                                            else reopenMsg = "The ticket was reopend by {member}";
                                                                                            embed.addField("Ticket reopened", reopenMsg, true);
                                                                                            embe.edit(embed);
                                                                                            response.delete();
                                                                                            tsg.delete();
                                                                                        }).then(() => {
                                                                                            message.channel.send(`What would you like the **delete** ticket message to be? (default/message)
                                                        
{member} = Username + discriminator
{username} = Username`)
                                                                                            .then(async (tsg) => {
                                                                                                message.channel.awaitMessages(filter, { max: 1 })
                                                                                                .then(res => {
                                                                                                    const response = res.first();
                                                                                                    if (response.content == "default") deleteMsg = "The ticket was deleted by {member}";
                                                                                                    else if (response.content) deleteMsg = response.content;
                                                                                                    else deleteMsg = "The ticket was deleted by {member}";
                                                                                                    embed.addField("Ticket deleted", deleteMsg, true);
                                                                                                    embe.edit(embed);
                                                                                                    response.delete();
                                                                                                    tsg.delete();
                                                                                                }).then(() => {
                                                                                                    message.channel.send(`What would you like the **forcefully deleted** ticket message to be? (default/message)

{member} = Username + discriminator
{username} = Username`)
                                                                                                    .then(async (tsg) => {
                                                                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                                                                        .then(res => {
                                                                                                            const response = res.first();
                                                                                                            if (response.content == "default") forcedeleteMsg = "The ticket was forcefully deleted by {member}";
                                                                                                            else if (response.content) forcedeleteMsg = response.content;
                                                                                                            else forcedeleteMsg = "The ticket was forcefully deleted by {member}";
                                                                                                            embed.addField("Ticket forcefully deleted ", forcedeleteMsg, true);
                                                                                                            embe.edit(embed);
                                                                                                            response.delete();
                                                                                                            tsg.delete();
                                                                                                        }).then(async () => {
                                                                                                            embed.setDescription("Final configuration:")
                                                                                                            embed.setColor("GREEN")
                                                                                                            embe.edit(embed);
                                                                                                            const newEmbed = new Discord.MessageEmbed()
                                                                                                                .setTitle("Open Ticket")
                                                                                                                .setDescription(`${openTicket}\n\nBy opening a ticket, you agree that your conversation will be recorded for legal and quality purposes.`)
                                                                                                                .setFooter(footer);
                                                                                                            await channel.send(newEmbed).then(m => {
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
                                                                                                                    react.footer = footer;
                                                                                                                    react.newTicket = newTicket;
                                                                                                                    react.closeMsg = closeMsg;
                                                                                                                    react.reopenMsg = reopenMsg;
                                                                                                                    react.deleteMsg = deleteMsg;
                                                                                                                    react.forcedeleteMsg = forcedeleteMsg;
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
                                                                                                                    footer: footer,
                                                                                                                    newTicket: newTicket,
                                                                                                                    closeMsg: closeMsg,
                                                                                                                    reopenMsg: reopenMsg,
                                                                                                                    deleteMsg: deleteMsg,
                                                                                                                    forcedeleteMsg: forcedeleteMsg,
                                                                                                                    pingOnTicket: pingOnTicket
                                                                                                                });
                                                                                                                await newReaction.save().catch(e => console.log(e));
                                                                                                            };
                                                                                                        });
                                                                                                    })
                                                                                                });
                                                                                            });
                                                                                        });
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        } else {
                                            const embed = new Discord.MessageEmbed()
                                                .setTitle("Configuration")
                                                .setColor("GREEN")
                                                .setDescription(`Current configuration:`)
                                                .addField("Ticket Channel", channel, true)
                                                .addField("Support role", support, true)
                                                .addField("Transcript channel", dLog, true)
                                                .addField("Category ID", categoryID, true)
                                                .setFooter(reactions.footer);
                                            if (supportID) message.channel.send(embed).then(async () => {
                                                const embed = new Discord.MessageEmbed()
                                                    .setTitle("Open Ticket")
                                                    .setDescription("Please react with 🎫 below to open a ticket.")
                                                    .setFooter(reactions.footer);
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
                                                        await react.save().catch(e => console.log(e));
                                                    });
                                        
                                                } else if (!reactions) {
                                                    const newReaction = new Reactions({
                                                        guildID: guildID,
                                                        channelID: channelID,
                                                        messageID: messageID,
                                                        supportID: supportID,
                                                        categoryID: categoryID,
                                                        logID: logID
                                                    });
                                                    await newReaction.save().catch(e => console.log(e));
                                                };
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    })
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