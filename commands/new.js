const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");
const Tickets = require("../models/tickets");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    let panelCheck = await Panels.find({
        guildID: guildID
    });
    if (panelCheck.length >= 1) {
        let type = args[0]
        if (!type) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${reactions.prefix}${this.help.usage}\``)

        let panels = await Panels.findOne({
            guildID: message.guild.id,
            ticketType: type
        });

        if (!panels) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${reactions.prefix}${this.help.usage}\``)

        let memberObj = message.guild.members.cache.get(message.author.id);
        let support = message.guild.roles.cache.get(panels.supportID);

        await Panels.findOne({
            guildID: message.guild.id,
            ticketType: type
        }, async (err, react) => {
            if (err) console.log(err);
            let tickets = await Tickets.findOne({
                guildID: message.guild.id,
                userID: memberObj.id
            });

            if (tickets && tickets.active) return memberObj.send("⛔ | You've already got a ticket opened.");

            react.ticket = react.ticket + 1;
            await react.save().catch(e => console.log(e));

            const logEmbed = new Discord.MessageEmbed()
                .setTitle("Ticket Opened")
                .addField("Ticket Opener", `<@${message.author.id}> [${message.author.id}]`)
                .setFooter(reactions.footer)
            let logChannel = message.guild.channels.cache.get(panels.logID);
            if (logChannel) logChannel.send(logEmbed);

            if (react.nameTicket) {
                message.guild.channels.create(`${panels.ticketType}-${memberObj.user.username}`, {
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
                            id: message.guild.id,
                            deny: ["VIEW_CHANNEL"]
                        }
                    ]
                }).then((c) => {
                    let pingMsg;
                    if (panels.pingOnTicket) pingMsg = `<@&${panels.supportID}>, <@${memberObj.id}>`;
                    else pingMsg = `<@${memberObj.id}>`;
                    c.send(pingMsg).then(async () => {
                        const embed = new Discord.MessageEmbed()
                            .setTitle("New Ticket")
                            .setFooter(reactions.footer)
                            .setDescription(panels.newTicket);
                        await c.send(embed).then(async (m) => {
                                tickets = new Tickets({
                                    guildID: message.guild.id,
                                    channelID: m.channel.id,
                                    messageID: m.id,
                                    userID: memberObj.id,
                                    ticket: react.ticket,
                                    ticketType: type
                                });
                                await tickets.save().catch(e => console.log(e));
                            m.react("🔒");
                        });
                        if(panels.categoryID != "none") c.setParent(panels.categoryID);
                    });
                });
            } else {
                message.guild.channels.create(`${panels.ticketType}-${react.ticket}`, {
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
                            id: message.guild.id,
                            deny: ["VIEW_CHANNEL"]
                        }
                    ]
                }).then((c) => {
                    let pingMsg;
                    if (panels.pingOnTicket) pingMsg = `<@&${panels.supportID}>, <@${memberObj.id}>`;
                    else pingMsg = `<@${memberObj.id}>`;
                    c.send(pingMsg).then(async () => {
                        const embed = new Discord.MessageEmbed()
                            .setTitle("New Ticket")
                            .setFooter(reactions.footer)
                            .setDescription(panels.newTicket);
                        await c.send(embed).then(async (m) => {
                                tickets = new Tickets({
                                    guildID: message.guild.id,
                                    channelID: m.channel.id,
                                    messageID: m.id,
                                    userID: memberObj.id,
                                    ticket: react.ticket,
                                    ticketType: type
                                });
                                await tickets.save().catch(e => console.log(e));
                            m.react("🔒");
                        });
                        if(panels.categoryID != "none") c.setParent(panels.categoryID);
                    });
                });
            }
        });
    } else {
        let panels = await Panels.findOne({
            guildID: message.guild.id,
            ticketType: type
        });

        let topic = args[0];
        if (!panels) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${reactions.prefix}${this.help.usage}\``)

        let memberObj = message.guild.members.cache.get(message.author.id);
        let support = message.guild.roles.cache.get(panels.supportID);

        await Panels.findOne({
            guildID: message.guild.id,
            ticketType: type
        }, async (err, react) => {
            if (err) console.log(err);
            let tickets = await Tickets.findOne({
                guildID: message.guild.id,
                userID: memberObj.id
            });

            if (tickets && tickets.active) return memberObj.send("⛔ | You've already got a ticket opened.");

            react.ticket = react.ticket + 1;
            await react.save().catch(e => console.log(e));

            const logEmbed = new Discord.MessageEmbed()
                .setTitle("Ticket Opened")
                .addField("Ticket Opener", `<@${message.author.id}> [${message.author.id}]`)
                .setFooter(reactions.footer)
            let logChannel = message.guild.channels.cache.get(panels.logID);
            if (logChannel) logChannel.send(logEmbed);
            if (panels.topic) {

                if (react.nameTicket) {
                    message.guild.channels.create(`${panels.ticketType}-${memberObj.user.username}`, {
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
                                id: message.guild.id,
                                deny: ["VIEW_CHANNEL"]
                            }
                        ]
                    }).then((c) => {
                        let pingMsg;
                        if (panels.pingOnTicket) pingMsg = `<@&${panels.supportID}>, <@${memberObj.id}>`;
                        else pingMsg = `<@${memberObj.id}>`;
                        c.send(pingMsg).then(async () => {
                            const embed = new Discord.MessageEmbed()
                                .setTitle("New Ticket")
                                .setFooter(reactions.footer)
                                .setDescription(panels.newTicket);
                            await c.send(embed).then(async (m) => {
                                    tickets = new Tickets({
                                        guildID: message.guild.id,
                                        channelID: m.channel.id,
                                        messageID: m.id,
                                        userID: memberObj.id,
                                        ticket: react.ticket,
                                        ticketType: type,
                                        ticketTopic: topic
                                    });
                                    await tickets.save().catch(e => console.log(e));
                                m.react("🔒");
                            });
                            if(panels.categoryID != "none") c.setParent(panels.categoryID);
                        });
                    });
                } else {
                    message.guild.channels.create(`${panels.ticketType}-${react.ticket}`, {
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
                                id: message.guild.id,
                                deny: ["VIEW_CHANNEL"]
                            }
                        ]
                    }).then((c) => {
                        let pingMsg;
                        if (panels.pingOnTicket) pingMsg = `<@&${panels.supportID}>, <@${memberObj.id}>`;
                        else pingMsg = `<@${memberObj.id}>`;
                        c.send(pingMsg).then(async () => {
                            const embed = new Discord.MessageEmbed()
                                .setTitle("New Ticket")
                                .setFooter(reactions.footer)
                                .setDescription(panels.newTicket);
                            await c.send(embed).then(async (m) => {
                                    tickets = new Tickets({
                                        guildID: message.guild.id,
                                        channelID: m.channel.id,
                                        messageID: m.id,
                                        userID: memberObj.id,
                                        ticket: react.ticket,
                                        ticketType: type,
                                        ticketTopic: topic
                                    });
                                    await tickets.save().catch(e => console.log(e));
                                m.react("🔒");
                            });
                            if(panels.categoryID != "none") c.setParent(panels.categoryID);
                        });
                    });
                }
            } else {
                if (react.nameTicket) {
                    message.guild.channels.create(`${panels.ticketType}-${memberObj.user.username}`, {
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
                                id: message.guild.id,
                                deny: ["VIEW_CHANNEL"]
                            }
                        ]
                    }).then((c) => {
                        let pingMsg;
                        if (panels.pingOnTicket) pingMsg = `<@&${panels.supportID}>, <@${memberObj.id}>`;
                        else pingMsg = `<@${memberObj.id}>`;
                        c.send(pingMsg).then(async () => {
                            const embed = new Discord.MessageEmbed()
                                .setTitle("New Ticket")
                                .setFooter(reactions.footer)
                                .setDescription(panels.newTicket);
                            await c.send(embed).then(async (m) => {
                                    tickets = new Tickets({
                                        guildID: message.guild.id,
                                        channelID: m.channel.id,
                                        messageID: m.id,
                                        userID: memberObj.id,
                                        ticket: react.ticket,
                                        ticketType: type
                                    });
                                    await tickets.save().catch(e => console.log(e));
                                m.react("🔒");
                            });
                            if(panels.categoryID != "none") c.setParent(panels.categoryID);
                        });
                    });
                } else {
                    message.guild.channels.create(`${panels.ticketType}-${react.ticket}`, {
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
                                id: message.guild.id,
                                deny: ["VIEW_CHANNEL"]
                            }
                        ]
                    }).then((c) => {
                        let pingMsg;
                        if (panels.pingOnTicket) pingMsg = `<@&${panels.supportID}>, <@${memberObj.id}>`;
                        else pingMsg = `<@${memberObj.id}>`;
                        c.send(pingMsg).then(async () => {
                            const embed = new Discord.MessageEmbed()
                                .setTitle("New Ticket")
                                .setFooter(reactions.footer)
                                .setDescription(panels.newTicket);
                            await c.send(embed).then(async (m) => {
                                    tickets = new Tickets({
                                        guildID: message.guild.id,
                                        channelID: m.channel.id,
                                        messageID: m.id,
                                        userID: memberObj.id,
                                        ticket: react.ticket,
                                        ticketType: type
                                    });
                                    await tickets.save().catch(e => console.log(e));
                                m.react("🔒");
                            });
                            if(panels.categoryID != "none") c.setParent(panels.categoryID);
                        });
                    });
                }
            }
        });
    }
    
}

module.exports.help = {
    name: "new",
    aliases: ["n"],
    usage: "new (type)",
    description: "Open a ticket by command.",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
