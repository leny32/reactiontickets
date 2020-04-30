const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");
const config = require("../config");
const axios = require("axios");

exports.run = async (client, guild, message, args) => {

    if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) return message.channel.send("I'm missing the Manage Messages permission.");
    if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.channel.send("I'm missing the Manage Channels permission.");

    let { data } = await axios.post(config.apiUrl + "premiumCheck", { "guildid": message.guild.id }, {
        headers: {
            'Authorization': `Bearer ${config.storeapi}`
        }
    });

    let premium = data.data;

    let guildID = message.guild.id;

    let reactions = await Reactions.findOne({
        guildID: guildID
    });

    let panel = await Panels.findOne({
        guildID: guildID
    });

    let panelCheck = await Panels.find({
        guildID: guildID
    })
    if (panelCheck.length >= 2 && !premium) return message.channel.send("Premium has not been bought on this server yet, to open more than two ticket panel at a time, please buy premium.");
    let configMessage = `\n\n{member} = Username + discriminator\n{username} = Username\n{executor} = Username + discriminator\n{executorusername} = Username`
    let messageID;
    let channelID;
    let supportID;
    let support;
    let logID;
    let categoryID;
    let openTicket;
    let newTicket;
    let closeMsg;
    let reopenMsg;
    let deleteMsg;
    let forcedeleteMsg;
    let pingOnTicket;
    let nameTicket;
    let topic;
    let transcriptOnDelete;
    let type;


    const embed = new Discord.MessageEmbed()
        embed.setTitle("Configuration")
        embed.setColor("ORANGE")
        embed.setDescription(`Current configuration:`)
    message.channel.send(embed).then(embe => {

        message.channel.send("**Step 1**: Please provide a channel from where tickets will be opened from. (mention/id/name)")
        .then(async (tsg) => {
            let filter = msg => {
                return msg.author.id === message.author.id
            };
            message.channel.awaitMessages(filter, { max: 1 })
            .then(res => {
                const response = res.first();
                if (response.mentions.channels.first() && response.mentions.channels.first().type === "text") channelID = response.mentions.channels.first().id;
                else if (message.guild.channels.cache.get(response.content) && message.guild.channels.cache.get(response.content).type === "text") channelID = response.content;
                else if (message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()) && message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()).type === "text") channelID = message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()).id;
                else { 
                    embed.setTitle("Cancelled")
                    embed.setColor("RED")
                    embe.edit(embed);
                    return message.channel.send("Couldn't find channel.");
                }
                channel = message.guild.channels.cache.get(channelID);
                if (!channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
                    channelID = "";
                    return message.channel.send("I'm missing the send messages permission in that channel.");
                }
                embed.addField("Ticket Channel", channel, true);
                embe.edit(embed);
                response.delete();
                tsg.delete();
            }).then(() => {
                if (channelID) message.channel.send("**Step 2**: Please provide a ticket log channel. (none/mention/id/name)\n(A ticket channel is where ticket-logs from tickets will be stored.)")
                .then(async (tsg) => {
                    if(channelID) message.channel.awaitMessages(filter, { max: 1 })
                    .then(res => {
                        const response = res.first();
                        if (response.mentions.channels.first() && response.mentions.channels.first().type === "text") logID = response.mentions.channels.first().id;
                        else if (message.guild.channels.cache.get(response.content) && message.guild.channels.cache.get(response.content).type === "text") logID = response.content;
                        else if (message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()) && message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()).type === "text") logID = message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()).id;
                        else {
                            logID = "none";
                        }
                        if (logID !== "none") {
                            if (!message.guild.channels.cache.get(logID).permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
                                channelID = "";
                                return message.channel.send("I'm missing the Send Messages permission in that channel.");
                            }
                            embed.addField("Ticket log channel", message.guild.channels.cache.get(logID), true);
                        } else {
                            embed.addField("Ticket log channel", logID, true);
                        }

                        embe.edit(embed);
                        response.delete();
                        tsg.delete();
                    }).then(() => {
                        message.channel.send("**Step 3**: Please provide a category for where tickets should be placed. (none/id/name)")
                        .then(async(tsg) => {
                            message.channel.awaitMessages(filter, { max: 1 })
                            .then(res => {
                             const response = res.first();
                                if (message.guild.channels.cache.get(response.content) && message.guild.channels.cache.get(response.content).type === "category") categoryID = response.content;
                                else if (message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()) && message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()).type === "category") categoryID = message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()).id;
                                else categoryID = "none";
                                embed.addField("Category ID", categoryID, true);
                                embe.edit(embed);
                                response.delete();
                                tsg.delete();
                             }).then(() => {
                                message.channel.send("**Step 4**: Please provide a support role, for which will have access to tickets. (mention/id/name)")
                                .then(async (tsg) => {
                                    message.channel.awaitMessages(filter, { max: 1 })
                                    .then(res => {
                                        const response = res.first();
                                        if (response.mentions.roles.first()) supportID = response.mentions.roles.first().id;
                                        else if (message.guild.roles.cache.get(response.content)) supportID = response.content;
                                        else if (message.guild.roles.cache.find(r => r.name.toLowerCase() == response.content.toLowerCase())) supportID = message.guild.roles.cache.find(r => r.name.toLowerCase() == response.content.toLowerCase()).id;
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
                                    }).then(async () => {
                                        if(supportID) message.channel.send(`**Step 5**: Would you like topics to be created when a ticket is created? (yes/no)`)
                                        .then(async (tsg) => {
                                            if (supportID) message.channel.awaitMessages(filter, { max: 1 })
                                            .then(res => {
                                                const response = res.first();
                                                if (response.content.toLowerCase() == "yes" || response.content.toLowerCase() == "y") topic = true;
                                                else if (response.content.toLowerCase() == "no" || response.content.toLowerCase() == "n") topic = false;
                                                else topic = false;
                                                embed.addField("Topic on ticket", topic, true);
                                                embe.edit(embed);
                                                response.delete();
                                                tsg.delete();
                                            }).then(async () => {
                                                if(premium) {
                                                    message.channel.send(`**Step 6**: Would you like ${support.name} to get pinged when a ticket is created? (yes/no)`)
                                                    .then(async (tsg) => {
                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                        .then(res => {
                                                            const response = res.first();
                                                            if (response.content.toLowerCase() == "yes" || response.content.toLowerCase() == "y") pingOnTicket = true;
                                                            else if (response.content.toLowerCase() == "no" || response.content.toLowerCase() == "n") pingOnTicket = false;
                                                            else pingOnTicket = false;
                                                            embed.addField("Ping on ticket", pingOnTicket, true);
                                                            embe.edit(embed);
                                                            response.delete();
                                                            tsg.delete();
                                                        }).then(() => {
                                                            if(supportID) message.channel.send(`**Step 7**: Would you like transcripts to be created when a ticket is deleted? (yes/no)`)
                                                            .then(async (tsg) => {
                                                                if (supportID) message.channel.awaitMessages(filter, { max: 1 })
                                                                .then(res => {
                                                                    const response = res.first();
                                                                    if (response.content.toLowerCase() == "yes" || response.content.toLowerCase() == "y") transcriptOnDelete = true;
                                                                    else if (response.content.toLowerCase() == "no" || response.content.toLowerCase() == "n") transcriptOnDelete = false;
                                                                    else transcriptOnDelete = false;
                                                                    embed.addField("Transcript on delete", transcriptOnDelete, true);
                                                                    embe.edit(embed);
                                                                    response.delete();
                                                                    tsg.delete();
                                                                }).then(() => {
                                                                    message.channel.send(`**Step 8**: Would you like to tickets to be named #ticket-${message.author.username} or #ticket-1? (username/number)`)
                                                                    .then(async (tsg) => {
                                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                                        .then(res => {
                                                                            const response = res.first();
                                                                            if (response.content.toLowerCase() == "username") nameTicket = true;
                                                                            else if (response.content.toLowerCase() == message.author.username.toLowerCase()) nameTicket = true;
                                                                            else if (response.content.toLowerCase() == "u") nameTicket = true;
                                                                            else if (response.content.toLowerCase() == "ticket") nameTicket = false;
                                                                            else if (response.content.toLowerCase() == "n") nameTicket = false;
                                                                            else nameTicket = false;
                                                                            embed.addField("Name Tickets", nameTicket, true);
                                                                            embe.edit(embed);
                                                                            response.delete();
                                                                            tsg.delete();
                                                                        }).then(() => {
                                                                            message.channel.send(`**Step 9**: What message would you like to send in ${channel}? (default/message)`)
                                                                            .then(async (tsg) => {
                                                                                message.channel.awaitMessages(filter, { max: 1 })
                                                                                .then(res => {
                                                                                    const response = res.first();
                                                                                    if (response.content.toLowerCase() == "default") openTicket = "React below to open a ticket.";
                                                                                    else if (response.content) openTicket = response.content
                                                                                    else openTicket = "React below to open a ticket."
                                                                                    embed.addField("Open ticket", openTicket, true);
                                                                                    embe.edit(embed);
                                                                                    response.delete();
                                                                                    tsg.delete();
                                                                                }).then(() => {
                                                                                    message.channel.send("**Step 10**: What message would you like to be sent when new tickets are opened? (default/message)")
                                                                                    .then(async (tsg) => {
                                                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                                                        .then(res => {
                                                                                            const response = res.first();
                                                                                            if (response.content.toLowerCase() == "default") newTicket = "You've opened a ticket, react below to close it.";
                                                                                            else if (response.content) newTicket = response.content;
                                                                                            else newTicket = "You've opened a ticket, react below to close it.";
                                                                                            embed.addField("New ticket", newTicket, true);
                                                                                            embe.edit(embed);
                                                                                            response.delete();
                                                                                            tsg.delete();
                                                                                        }).then(() => {
                                                                                            message.channel.send("**Step 11**: What would you like to be ticket name of this setup? (default/message)")
                                                                                            .then(async (tsg) => {
                                                                                                message.channel.awaitMessages(filter, { max: 1 })
                                                                                                .then(async (res) => {
                                                                                                    const response = res.first();

                                                                                                    let nameCheck = await Panels.findOne({
                                                                                                        guildID: message.guild.id,
                                                                                                        ticketType: response.content
                                                                                                    });
                                                                                                    if (nameCheck) return message.channel.send(`A panel is already named ${response.content}.`);

                                                                                                    if (response.content.toLowerCase() == "default") type = "Ticket";
                                                                                                    else if (response.content) type = response.content;
                                                                                                    else type = "Ticket";
                                                                                                    embed.setTitle(type);
                                                                                                    embe.edit(embed);
                                                                                                    response.delete();
                                                                                                    tsg.delete();
                                                                                                }).then(() => {
                                                                                                    if (!nameCheck) message.channel.send(`**Step 12**: What would you like the **close** ticket message to be? (default/message) ${configMessage}`)
                                                                                                    .then(async (tsg) => {
                                                                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                                                                        .then(res => {
                                                                                                            const response = res.first();
                                                                                                            if (response.content.toLowerCase() == "default") closeMsg = "The ticket was closed by {executor}";
                                                                                                            else if (response.content) closeMsg = response.content;
                                                                                                            else closeMsg = "The ticket was closed by {executor}";
                                                                                                            embed.addField("Ticket closed", closeMsg, true);
                                                                                                            embe.edit(embed);
                                                                                                            response.delete();
                                                                                                            tsg.delete();
                                                                                                        }).then(() => {
                                                                                                            message.channel.send(`**Step 13**: What would you like the **reopen** ticket message to be? (default/message) ${configMessage}`)
                                                                                                            .then(async (tsg) => {
                                                                                                                message.channel.awaitMessages(filter, { max: 1 })
                                                                                                                .then(res => {
                                                                                                                    const response = res.first();
                                                                                                                    if (response.content.toLowerCase() == "default") reopenMsg = "The ticket was reopened by {executor}";
                                                                                                                    else if (response.content) reopenMsg = response.content;
                                                                                                                    else reopenMsg = "The ticket was reopend by {executor}";
                                                                                                                    embed.addField("Ticket reopened", reopenMsg, true);
                                                                                                                    embe.edit(embed);
                                                                                                                    response.delete();
                                                                                                                    tsg.delete();
                                                                                                                }).then(() => {
                                                                                                                    message.channel.send(`**Step 14**: What would you like the **delete** ticket message to be? (default/message) ${configMessage}`)
                                                                                                                    .then(async (tsg) => {
                                                                                                                        message.channel.awaitMessages(filter, { max: 1 })
                                                                                                                        .then(res => {
                                                                                                                            const response = res.first();
                                                                                                                            if (response.content.toLowerCase() == "default") deleteMsg = "The ticket was deleted by {executor}";
                                                                                                                            else if (response.content) deleteMsg = response.content;
                                                                                                                            else deleteMsg = "The ticket was deleted by {executor}";
                                                                                                                            embed.addField("Ticket deleted", deleteMsg, true);
                                                                                                                            embe.edit(embed);
                                                                                                                            response.delete();
                                                                                                                            tsg.delete();
                                                                                                                        }).then(() => {
                                                                                                                            message.channel.send(`**Step 15**: What would you like the **forcefully deleted** ticket message to be? (default/message) ${configMessage}`)
                                                                                                                            .then(async (tsg) => {
                                                                                                                                message.channel.awaitMessages(filter, { max: 1 })
                                                                                                                                .then(res => {
                                                                                                                                    const response = res.first();
                                                                                                                                    if (response.content.toLowerCase() == "default") forcedeleteMsg = "The ticket was forcefully deleted by {executor}";
                                                                                                                                    else if (response.content) forcedeleteMsg = response.content;
                                                                                                                                    else forcedeleteMsg = "The ticket was forcefully deleted by {executor}";
                                                                                                                                    embed.addField("Ticket forcefully deleted ", forcedeleteMsg, true);
                                                                                                                                    embe.edit(embed);
                                                                                                                                    response.delete();
                                                                                                                                    tsg.delete();
                                                                                                                                }).then(async () => {
                                                                                                                                    embed.setDescription("Final configuration:")
                                                                                                                                    embed.setColor("GREEN")
                                                                                                                                    embe.edit(embed);
                                                                                                                                        const newEmbed = new Discord.MessageEmbed()
                                                                                                                                        .setTitle(`Open ${type}`)
                                                                                                                                        .setDescription(`${openTicket}\n\nBy opening a ticket, you agree that your conversation will be recorded for legal and quality purposes.`)
                                                                                                                                        .setFooter(reactions.footer);
                                                                                                                                    await channel.send(newEmbed).then(m => {
                                                                                                                                        messageID = m.id;
                                                                                                                                        m.react("🎫");
                                                                                                                                    }).then(async () => {
                                                                                                                                        const newReaction = new Panels({
                                                                                                                                            guildID: guildID,
                                                                                                                                            channelID: channelID,
                                                                                                                                            messageID: messageID,
                                                                                                                                            supportID: supportID,
                                                                                                                                            categoryID: categoryID,
                                                                                                                                            logID: logID,
                                                                                                                                            ticketType: type,
                                                                                                                                            newTicket: newTicket,
                                                                                                                                            closeMsg: closeMsg,
                                                                                                                                            reopenMsg: reopenMsg,
                                                                                                                                            deleteMsg: deleteMsg,
                                                                                                                                            forcedeleteMsg: forcedeleteMsg,
                                                                                                                                            pingOnTicket: pingOnTicket,
                                                                                                                                            nameTicket: nameTicket,
                                                                                                                                            transcriptOnDelete: transcriptOnDelete,
                                                                                                                                            topic: topic
                                                                                                                                        });
                                                                                                                                        await newReaction.save().catch(e => console.log(e));
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
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                } else {
                                                    const embed = new Discord.MessageEmbed()
                                                        .setTitle("Open Ticket")
                                                        .setDescription("Please react with 🎫 below to open a ticket.")
                                                        .setFooter(reactions.footer);
                                                    await channel.send(embed).then(m => {
                                                        messageID = m.id;
                                                        m.react("🎫");
                                                    });
                        
                                                    if (panel) {
                                                        await Panels.findOne({
                                                            guildID: guildID
                                                        }, async (err, react) => {
                                                            if (err) console.log(err);
                                                            react.channelID = channelID;
                                                            react.messageID = messageID
                                                            react.supportID = supportID;
                                                            react.categoryID = categoryID;
                                                            react.logID = logID;
                                                            react.topic = topic;
                                                            await react.save().catch(e => console.log(e));
                                                        });
                                            
                                                    } else if (!panel) {
                                                        const newReaction = new Panels({
                                                            guildID: guildID,
                                                            channelID: channelID,
                                                            messageID: messageID,
                                                            supportID: supportID,
                                                            categoryID: categoryID,
                                                            logID: logID,
                                                            topic: topic
                                                        });
                                                        await newReaction.save().catch(e => console.log(e));
                                                    };
                                                }
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
    })
};

module.exports.help = {
    name: "setup",
    aliases: ["s"],
    usage: "setup",
    description: "Setup the bot",
    perms: 3
};

module.exports.limits = {
    rateLimit: 1,
    cooldown: 10000
}