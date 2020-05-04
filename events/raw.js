const Discord = require("discord.js");
const config = require("../config");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");
const Tickets = require("../models/tickets");

exports.run = async (client, event) => {

    if (event.t === 'MESSAGE_REACTION_ADD') {

        let reactions = await Reactions.findOne({
            channelID: event.d.channel_id
        });

        let panels = await Panels.findOne({
            channelID: event.d.channel_id
        });

        let panel = await Panels.findOne({
            channelID: event.d.channel_id,
            messageID: event.d.message_id
        });

        let ticket = await Tickets.findOne({
            channelID: event.d.channel_id
        });


        if (panels) {
            if (event.d.emoji.name == "🎫") {
                if (event.d.message_id != panel.messageID) return;
                let channel = client.channels.cache.get(panel.channelID);
                await channel.messages.fetch(panel.messageID).then(async (msg) => {
                    let user = msg.guild.members.cache.get(event.d.user_id);
                    if (user && user.id !== client.user.id && !user.user.bot) {
                        let memberObj = msg.guild.members.cache.get(user.id);
                        let support = msg.guild.roles.cache.get(panel.supportID);
                        msg.reactions.cache.get("🎫").users.remove(memberObj);
                        await Panels.findOne({
                            channelID: event.d.channel_id,
                            messageID: event.d.message_id
                        }, async (err, react) => {
                            if (err) console.log(err);
                            let tickets = await Tickets.findOne({
                                guildID: msg.guild.id,
                                userID: memberObj.id,
                                ticketType: react.ticketType
                            });

                            let coolTicket = await Tickets.find({
                                guildID: msg.guild.id,
                                userID: memberObj.id,
                                ticketType: react.ticketType
                            })
                            let fucked = false;
                            for (let i = 0; i < coolTicket.length; i++) {
                                if (coolTicket[i] && coolTicket[i].active) {
                                    fucked = true
                                    memberObj.send("⛔ | You've already got a ticket opened.").catch(err => { })
                                    break;
                                }
                            }
                            if (fucked) return;
                            react.ticket = react.ticket + 1;
                            await react.save().catch(e => console.log(e));

                            let reactions = await Reactions.findOne({
                                guildID: msg.guild.id
                            });

                            const logEmbed = new Discord.MessageEmbed()
                                .setTitle("Ticket Opened")
                                .addField("Ticket Opener", `<@${memberObj.id}> [${memberObj.id}]`)
                                .setFooter(reactions.footer)
                            let logChannel = msg.guild.channels.cache.get(panel.logID);
                            if (logChannel) logChannel.send(logEmbed).catch(err => { })

                            if (react.nameTicket) {
                                msg.guild.channels.create(`${panel.ticketType}-${memberObj.user.username}`, {
                                    type: "text",
                                    permissionOverwrites: [
                                        {
                                            id: support.id,
                                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                                        },
                                        {
                                            id: memberObj.id,
                                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                                        },
                                        {
                                            id: msg.guild.id,
                                            deny: ["VIEW_CHANNEL"]
                                        }
                                    ]
                                }).then((c) => {
                                    let pingMsg;
                                    if (panel.pingOnTicket) pingMsg = `<@&${panel.supportID}>, <@${memberObj.id}>`;
                                    else pingMsg = `<@${memberObj.id}>`;
                                    c.send(pingMsg).catch(err => { }).then(async () => {
                                        const embed = new Discord.MessageEmbed()
                                            .setTitle("New Ticket")
                                            .setFooter(reactions.footer)
                                            .setDescription(panel.newTicket);
                                        await c.send(embed).catch(err => { }).then(async (m) => {
                                            tickets = new Tickets({
                                                guildID: msg.guild.id,
                                                channelID: m.channel.id,
                                                messageID: m.id,
                                                userID: memberObj.id,
                                                ticketType: react.ticketType,
                                                ticket: react.ticket
                                            });
                                            await tickets.save().catch(e => console.log(e));
                                            m.pin().catch(err => { });
                                            m.react("🔒").catch(err => { });
                                        });
                                        if (panel.categoryID != "none") c.setParent(panel.categoryID).catch(err => { })
                                    });
                                });
                            } else {
                                msg.guild.channels.create(`${panel.ticketType}-${react.ticket}`, {
                                    type: "text",
                                    permissionOverwrites: [
                                        {
                                            id: support.id,
                                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                                        },
                                        {
                                            id: memberObj.id,
                                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                                        },
                                        {
                                            id: msg.guild.id,
                                            deny: ["VIEW_CHANNEL"]
                                        }
                                    ]
                                }).catch(err => { }).then((c) => {
                                    let pingMsg;
                                    if (panel.pingOnTicket) pingMsg = `<@&${panel.supportID}>, <@${memberObj.id}>`;
                                    else pingMsg = `<@${memberObj.id}>`;
                                    c.send(pingMsg).catch(err => { }).then(async () => {
                                        const embed = new Discord.MessageEmbed()
                                            .setTitle("New Ticket")
                                            .setFooter(reactions.footer)
                                            .setDescription(panel.newTicket);
                                        await c.send(embed).then(async (m) => {
                                            tickets = new Tickets({
                                                guildID: msg.guild.id,
                                                channelID: m.channel.id,
                                                messageID: m.id,
                                                userID: memberObj.id,
                                                ticketType: react.ticketType,
                                                ticket: react.ticket
                                            });
                                            await tickets.save().catch(e => console.log(e));
                                            m.pin().catch(err => { });
                                            m.react("🔒");
                                        });
                                        if (panel.categoryID != "none") c.setParent(panel.categoryID).catch(err => { })
                                    });
                                });
                            }
                        });
                    };
                });
            }
        } else if (ticket) {
            if (ticket.active) {
                if (event.d.emoji.name == "🔒") {
                    if (event.d.message_id != ticket.messageID) return;
                    let channel = client.channels.cache.get(ticket.channelID);
                    await channel.messages.fetch(ticket.messageID).then(async (msg) => {
                        let user = msg.guild.members.cache.get(event.d.user_id);
                        if (user.id !== client.user.id && !user.user.bot) {
                            let staff = msg.guild.members.cache.get(user.id);
                            let ticketOwner = await client.users.fetch(ticket.userID);
                            msg.reactions.cache.get("🔒").users.remove(staff);

                            channel.updateOverwrite(ticket.userID, {
                                VIEW_CHANNEL: false
                            });

                            let reactions = await Reactions.findOne({
                                guildID: msg.guild.id
                            });

                            let panel = await Panels.findOne({
                                guildID: ticket.guildID,
                                ticketType: ticket.ticketType
                            });

                            const logEmbed = new Discord.MessageEmbed()
                                .setTitle(`Ticket ${ticket.ticket} | Closed`)
                                .addField("Channel", `<#${ticket.channelID}> [${ticket.channelID}]`)
                                .addField("Ticket Opener", `${ticketOwner} [${ticketOwner.id}]`)
                                .addField("Ticket Closer", `${staff} [${staff.id}]`)
                                .setFooter(reactions.footer)
                            let logChannel = msg.guild.channels.cache.get(panel.logID);
                            if (logChannel) logChannel.send(logEmbed).catch(err => { });

                            channel.send(panel.closeMsg.replace('{executor}', staff.user.tag).replace('{executorusername}', staff.user.username).replace('{member}', ticketOwner.tag).replace('{username}', ticketOwner.username)).catch(err => { }).then(() => {
                                const embed = new Discord.MessageEmbed()
                                    .setTitle("Staff Tool")
                                    .setDescription(`**Save transcript**: 📑
**Reopen ticket**: 🔓
**Delete ticket**: ⛔`)
                                    .setFooter(reactions.footer)
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
                };
            } else if (!ticket.active) {
                if (event.d.emoji.name == "🔓") {
                    if (event.d.message_id != ticket.staffTool) return;
                    let channel = client.channels.cache.get(ticket.channelID);
                    await channel.messages.fetch(ticket.staffTool).then(async (msg) => {
                        let user = msg.guild.members.cache.get(event.d.user_id);
                        if (user.id !== client.user.id && !user.user.bot) {
                            let staff = msg.guild.members.cache.get(user.id);
                            let ticketOwner = await client.users.fetch(ticket.userID);
                            msg.reactions.cache.get("🔓").users.remove(staff);

                            await Tickets.findOne({
                                guildID: msg.guild.id,
                                channelID: msg.channel.id
                            }, async (err, ticket) => {
                                if (err) console.log(err);
                                ticket.active = true;
                                await ticket.save().catch(e => console.log(e));
                            });

                            if (msg.guild.members.cache.get(ticket.userID)) channel.updateOverwrite(ticket.userID, {
                                VIEW_CHANNEL: true
                            });

                            let reactions = await Reactions.findOne({
                                guildID: msg.guild.id
                            });

                            let panel = await Panels.findOne({
                                guildID: msg.guild.id,
                                ticketType: ticket.ticketType
                            });

                            const logEmbed = new Discord.MessageEmbed()
                                .setTitle(`Ticket ${ticket.ticket} | Reopened`)
                                .addField("Channel", `<#${ticket.channelID}> [${ticket.channelID}]`)
                                .addField("Ticket Opener", `${ticketOwner} [${ticketOwner.id}]`)
                                .addField("Ticket Reopener", `${staff} [${staff.id}]`)
                                .setFooter(reactions.footer)
                            let logChannel = msg.guild.channels.cache.get(panel.logID);
                            if (logChannel) logChannel.send(logEmbed).catch(err => { })

                            msg.delete().catch(err => { })

                            channel.send(panel.reopenMsg.replace('{executor}', staff.user.tag).replace('{executorusername}', staff.user.username).replace('{member}', ticketOwner.tag).replace('{username}', ticketOwner.username)).catch(err => { });
                        };
                    });
                } else if (event.d.emoji.name == "📑") {
                    if (event.d.message_id != ticket.staffTool) return;
                    let channel = client.channels.cache.get(ticket.channelID);
                    await channel.messages.fetch(ticket.staffTool).then(async (msg) => {
                        let user = msg.guild.members.cache.get(event.d.user_id);
                        if (user.id !== client.user.id && !user.user.bot) {
                            let staff = msg.guild.members.cache.get(user.id);
                            msg.reactions.cache.get("📑").users.remove(staff);

                            let reactions = await Reactions.findOne({
                                guildID: msg.guild.id
                            });

                            let panel = await Panels.findOne({
                                guildID: msg.guild.id,
                                ticketType: ticket.ticketType
                            });

                            const logEmbed = new Discord.MessageEmbed()
                                .setTitle(`Ticket ${ticket.ticket} | Transcript`)
                                .addField("Channel", `<#${ticket.channelID}> [${ticket.channelID}]`)
                                .addField("Ticket Opener", `<@${ticket.userID}> [${ticket.userID}]`)
                                .addField("Saved by", `${staff} [${staff.id}]`)
                                .setFooter(reactions.footer)
                            let logChannel = msg.guild.channels.cache.get(panel.logID);
                            if (logChannel) logChannel.send(logEmbed).catch(err => { })

                            channel.messages.fetch({ limit: 100 }).catch(err => { }).then(async (fetched) => {
                                fetched = fetched.array().reverse();
                                const mapped = fetched.map(m => `${m.author.tag}: ${m.content}`).join('\n');
                                const att = new Discord.MessageAttachment(Buffer.from(mapped), `Transcript-${ticket.userID}.txt`);
                                if (logChannel) logChannel.send(att).catch(err => { })
                                else channel.send(att).catch(err => { })
                            });
                        };
                    });
                } else if (event.d.emoji.name == "⛔") {
                    if (event.d.message_id != ticket.staffTool) return;
                    let channel = client.channels.cache.get(ticket.channelID);
                    await channel.messages.fetch(ticket.staffTool).then(async (msg) => {
                        let user = msg.guild.members.cache.get(event.d.user_id);
                        if (user.id !== client.user.id && !user.user.bot) {
                            let staff = msg.guild.members.cache.get(user.id);
                            let ticketOwner = await client.users.fetch(ticket.userID);
                            let reactions = await Reactions.findOne({
                                guildID: msg.guild.id
                            });

                            let panel = await Panels.findOne({
                                guildID: msg.guild.id,
                                ticketType: ticket.ticketType
                            });
                            const logEmbed = new Discord.MessageEmbed()
                                .setTitle(`Ticket ${ticket.ticket} | Deleted`)
                                .addField("Channel", `[${ticket.channelID}]`)
                                .addField("Ticket Opener", `<@${ticket.userID}> [${ticket.userID}]`)
                                .addField("Deleted by", `${staff} [${staff.id}]`)
                                .setFooter(reactions.footer)
                            if (panel.topic) logEmbed.addField("Topic", ticket.ticketTopic)

                            let logChannel = msg.guild.channels.cache.get(panel.logID);
                            if (logChannel) logChannel.send(logEmbed).catch(err => { })

                            let mapped;

                            channel.send(panel.deleteMsg.replace('{executor}', staff.user.tag).replace('{executorusername}', staff.user.username).replace('{member}', ticketOwner.tag).replace('{username}', ticketOwner.username)).catch(err => { }).then(() => {
                                channel.messages.fetch({ limit: 100 }).catch(err => { }).then(async (fetched) => {
                                    fetched = fetched.array().reverse();
                                    if (panel.transcriptOnDelete) {
                                        mapped = fetched.map(m => `${m.author.tag}: ${m.content}`).join('\n');
                                        const att = new Discord.MessageAttachment(Buffer.from(mapped), `Transcript-${ticket.userID}.txt`);
                                        let logChannel = msg.guild.channels.cache.get(panel.logID);
                                        if (logChannel) logChannel.send(att).catch(err => { })
                                    }
                                }).then(async () => {
                                    await Tickets.findOneAndDelete({
                                        channelID: channel.id,
                                        active: false
                                    });
                                    channel.delete().catch(err => { })
                                    if (!panel.noDMTicket) {
                                        let endMessage = `Hey ${ticketOwner.username},
                                        
Thank you for making a ticket with Reaction Tickets.`
                                        try {
                                            if (panel.transcriptOnDelete) ticketOwner.send(endMessage, { files: [{ attachment: Buffer.from(mapped), name: `Transcript-${ticket.userID}.txt` }] }).catch(err => { console.log(err) })
                                            else ticketOwner.send(endMessage);
                                        } catch { }
                                    }
                                });
                            });
                        };
                    });
                };
            };
        };
    };
};