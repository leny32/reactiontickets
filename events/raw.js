const Discord = require("discord.js");
const config = require("../config");
const Reactions = require("../models/reactions");
const Tickets = require("../models/tickets");

exports.run = async (client, event) => {

    if (event.t === 'MESSAGE_REACTION_ADD') {

        const reactions = await Reactions.findOne({
            channelID: event.d.channel_id
        });

        let ticket = await Tickets.findOne({
            channelID: event.d.channel_id
        });

        
        if (reactions) {
            if (event.d.emoji.name == "🎫") {
                if (event.d.message_id != reactions.messageID) return;
                let channel = client.channels.cache.get(reactions.channelID);
                await channel.messages.fetch(reactions.messageID).then(async (msg) => {
                    let user = msg.guild.members.cache.get(event.d.user_id);
                    if (user.id !== client.user.id) {
                        let memberObj = msg.guild.members.cache.get(user.id);
                        let support = msg.guild.roles.cache.get(reactions.supportID);
                        msg.reactions.cache.get("🎫").users.remove(memberObj);
                        await Reactions.findOne({
                            channelID: event.d.channel_id
                        }, async (err, react) => {
                            if (err) console.log(err);
                            let tickets = await Tickets.findOne({
                                guildID: msg.guild.id,
                                userID: memberObj.id
                            });

                            if (tickets && tickets.active) return memberObj.send("You've already got a ticket opened.");

                            react.ticket = react.ticket + 1;
                            await react.save().catch(e => console.log(e));

                            msg.guild.channels.create(`ticket-${react.ticket}`, {
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
                                if (reactions.pingOnTicket) pingMsg = `<@&${reactions.supportID}>, <@${memberObj.id}>`;
                                else pingMsg = `<@${memberObj.id}>`;
                                c.send(pingMsg).then(() => {
                                    const embed = new Discord.MessageEmbed()
                                        .setTitle("New Ticket")
                                        .setDescription("The ticket can be closed by reacting 🔒 under this message.");
                                    c.send(embed).then(async (m) => {
                                            tickets = new Tickets({
                                                guildID: msg.guild.id,
                                                channelID: m.channel.id,
                                                messageID: m.id,
                                                userID: memberObj.id,
                                                ticket: react.ticket
                                            });
                                            await tickets.save().catch(e => console.log(e));
                                        m.react("🔒");
                                    });
                                    if(reactions.categoryID != "none") c.setParent(reactions.categoryID);
                                });
                            });
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
                        if (user.id !== client.user.id) {
                            let memberObj = msg.guild.members.cache.get(user.id);
                            msg.reactions.cache.get("🔒").users.remove(memberObj);

                            channel.updateOverwrite(memberObj.id, {
                                VIEW_CHANNEL: false
                            });
                            channel.send(`The ticket was closed by ${memberObj.user.tag}`).then(()=> {
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
                };
            } else if (!ticket.active) {
                if (event.d.emoji.name == "🔓") {
                    if (event.d.message_id != ticket.staffTool) return;
                    let channel = client.channels.cache.get(ticket.channelID);
                    await channel.messages.fetch(ticket.staffTool).then(async (msg) => {
                        let user = msg.guild.members.cache.get(event.d.user_id);
                        if (user.id !== client.user.id) {
                            let memberObj = msg.guild.members.cache.get(user.id);
                            msg.reactions.cache.get("🔓").users.remove(memberObj);

                            await Tickets.findOne({
                                guildID: msg.guild.id,
                                channelID: msg.channel.id
                            }, async (err, ticket) => {
                                if (err) console.log(err);
                                ticket.active = true;
                                await ticket.save().catch(e => console.log(e));
                            });

                            channel.updateOverwrite(memberObj.id, {
                                VIEW_CHANNEL: true
                            });

                            msg.delete();

                            channel.send(`The ticket was reopened by ${memberObj.user.tag}.`);
                        };
                    });
                } else if (event.d.emoji.name == "📑") {
                    if (event.d.message_id != ticket.staffTool) return;
                    let channel = client.channels.cache.get(ticket.channelID);
                    await channel.messages.fetch(ticket.staffTool).then(async (msg) => {
                        let user = msg.guild.members.cache.get(event.d.user_id);
                        if (user.id !== client.user.id) {
                            let memberObj = msg.guild.members.cache.get(user.id);
                            msg.reactions.cache.get("📑").users.remove(memberObj);

                            let reactions = await Reactions.findOne({
                                guildID: msg.guild.id
                            });

                            channel.messages.fetch({ limit: 100 }).then(async (fetched) => {
                                fetched = fetched.array().reverse();
                                const mapped = fetched.map(m => `${m.author.tag}: ${m.content}`).join('\n');
                                const att = new Discord.MessageAttachment(Buffer.from(mapped), `Transcript-${ticket.userID}.txt`);
                                let logChannel = msg.guild.channels.cache.get(reactions.logID);
                                if (logChannel) logChannel.send(att);
                                else channel.send(att);
                            });
                        };
                    });
                } else if (event.d.emoji.name == "⛔") {
                    if (event.d.message_id != ticket.staffTool) return;
                    let channel = client.channels.cache.get(ticket.channelID);
                    await channel.messages.fetch(ticket.staffTool).then(async (msg) => {
                        let user = msg.guild.members.cache.get(event.d.user_id);
                        if (user.id !== client.user.id) {
                            let memberObj = msg.guild.members.cache.get(user.id);
                            let reactions = await Reactions.findOne({
                                guildID: msg.guild.id
                            });

                            channel.send(`The ticket was deleted by ${memberObj.user.tag}.`).then(() => {
                                channel.messages.fetch({ limit: 100 }).then(async (fetched) => {
                                    fetched = fetched.array().reverse();
                                    const mapped = fetched.map(m => `${m.author.tag}: ${m.content}`).join('\n');
                                    const att = new Discord.MessageAttachment(Buffer.from(mapped), `Transcript-${ticket.userID}.txt`);
                                    let logChannel = msg.guild.channels.cache.get(reactions.logID);
                                    if (logChannel) logChannel.send(att);
                                }).then(async () => {
                                    await Tickets.findOneAndDelete({
                                        channelID: channel.id,
                                        active: false
                                    });
                                    channel.delete();
                                });
                            });
                        };
                    });
                };
            };
        };
    };
};