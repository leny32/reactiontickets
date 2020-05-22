const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const Panels = require("../models/panels");
const config = require("../config");
const axios = require("axios");

exports.run = async (client, guild, message, args) => {

    let guildID = message.guild.id;

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    let { data } = await axios.post(config.apiUrl + "premiumCheck", { "guildid": message.guild.id }, {
        headers: {
            'Authorization': `Bearer ${config.storeapi}`
        }
    });

    let premium = data.data;

    let panelCheck = await Panels.find({
        guildID: guildID
    });
    if (panelCheck.length >= 2 && !premium) return message.channel.send("Premium has not been bought on this server yet, to open more than two ticket panel at a time, please buy premium.");

    if (premium && !args[0]) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${guild.prefix}${this.help.usage}\``);
    if (args[0] && args[0].toLowerCase() == "advanced" && !premium) return message.channel.send("Premium has not been bought on this server yet, to use advanced setup, please buy premium.");
    let setupT = premium && args[0] && args[0].toLowerCase() == "advanced" ? "advanced" : "simple";
    let setupType = setupT.charAt(0).toUpperCase() + setupT.slice(1, 8);

    let setupNumber = 17;

    let cancel = `the cancel command being issued`;
    let configMessage = `\n\n{member} = Username + discriminator\n{username} = Username\n{executor} = Username + discriminator\n{executorusername} = Username`
    let messageID; let channelID; let channel; let lg; let noDMTicket; let supportID; let support; let logID; let categoryID; let openTicket; let newTicket; let closeMsg; let reopenMsg; let deleteMsg; let forcedeleteMsg; let pingOnTicket; let nameTicket; let topic; let transcriptOnDelete; let type;
    let filter = msg => { return msg.author.id === message.author.id };

    const embed = new Discord.MessageEmbed().setTitle(`${setupType} Configuration`).setColor("ORANGE").setDescription(`Current configuration:`);
    message.channel.send(embed).catch(err => { }).then(async (embe) => {
        function cancelReason(reason) { embed.setTitle("Cancelled").setColor("RED"); embe.edit(embed).catch(err => { }); return message.channel.send(`The setup has been canceled due to, ${reason}.`).catch(err => { }); };
        for (let i = 1; i <= setupNumber; i++) {
            let step = `**Step ${i}**:`;
            switch (i) {
                case 1:
                    await message.channel.send(`${step} Please provide a channel from where tickets will be opened from. (mention/id/name)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(async (res) => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                channelID = response.mentions.channels.first() && response.mentions.channels.first().type === "text" ? response.mentions.channels.first().id : message.guild.channels.cache.get(response.content) && message.guild.channels.cache.get(response.content).type === "text" ? message.guild.channels.cache.get(response.content) : message.guild.channels.cache.find(c => c.name.toLowerCase() === response.content.toLowerCase()) ? message.guild.channels.cache.find(c => c.name.toLowerCase() === response.content.toLowerCase()).id : "none";
                                channel = message.guild.channels.cache.get(channelID);
                                if (channel) { channel = channel } else { try { channel = await message.guild.channels.fetch(channelID) } catch (err) { } }
                                if (!channel) channel = "none";
                                if (!channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) { channelID = ""; cancelReason("I'm missing the send messages permission in that channel"); return i = setupNumber; }
                                if (channelID === "none") { cancelReason("couldn't find channel"); return i = setupNumber; }
                                embed.addField("Ticket Channel", channel, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 2:
                    await message.channel.send(`${step} Please provide a ticket log channel. (none/mention/id/name)\n(A ticket channel is where ticket-logs from tickets will be stored.)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(async (res) => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                logID = response.mentions.channels.first() && response.mentions.channels.first().type === "text" ? response.mentions.channels.first().id : message.guild.channels.cache.get(response.content) && message.guild.channels.cache.get(response.content).type === "text" ? message.guild.channels.cache.get(response.content) : message.guild.channels.cache.find(c => c.name.toLowerCase() === response.content.toLowerCase()) ? message.guild.channels.cache.find(c => c.name.toLowerCase() === response.content.toLowerCase()).id : "none";
                                if (!logID) logID = "none";
                                if (logID === "none") lg = "none"; else { if (lg = message.guild.channels.cache.get(logID)) lg = message.guild.channels.cache.get(logID); else { try { lg = await message.guild.channels.fetch(logID) } catch (err) { } } }
                                if (!lg) lg = "none";
                                if (lg !== "none" && !lg.permissionsFor(message.guild.me).has("SEND_MESSAGES")) { logID = "none"; cancelReason("I'm missing the Send Messages permission in that channel"); return i = setupNumber; }
                                embed.addField("Ticket log channel", lg, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 3:
                    await message.channel.send(`${step} Please provide a category for where tickets should be placed. (none/id/name)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(async (res) => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                categoryID = message.guild.channels.cache.get(response.content);
                                if (!categoryID) { try { categoryID = await message.guild.channels.fetch(response.content) } catch (err) { } }
                                categoryID = message.guild.channels.cache.get(response.content) && message.guild.channels.cache.get(response.content).type === "category" ? response.content : message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()) && message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()).type === "category" ? message.guild.channels.cache.find(c => c.name.toLowerCase() == response.content.toLowerCase()).id : "none"
                                embed.addField("Category ID", categoryID, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 4:
                    await message.channel.send(`${step} Please provide a support role, for which will have access to tickets. (mention/id/name)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(async (res) => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                supportID = message.guild.roles.cache.get(response.content);
                                if (!supportID) { try { await message.guild.roles.fetch(response.content) } catch { } }
                                supportID = response.mentions.roles.first() ? response.mentions.roles.first().id : message.guild.roles.cache.get(response.content) ? response.content : message.guild.roles.cache.find(r => r.name.toLowerCase() == response.content.toLowerCase()) ? message.guild.roles.cache.find(r => r.name.toLowerCase() == response.content.toLowerCase()).id : "none";
                                support = message.guild.roles.cache.get(supportID);
                                if (supportID === "none") { cancelReason("couldn't find role"); return i = setupNumber; }
                                embed.addField("Support role", support, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 5:
                    await message.channel.send(`${step} Would you like topics to be created when a ticket is created? (yes/no)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                topic = response.content.toLowerCase() == "yes" || response.content.toLowerCase() == "y" ? true : false;
                                embed.addField("Topic on ticket", topic, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 6:
                    await message.channel.send(`${step} What would you like to be ticket name of this setup? (default/message)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(async (res) => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                type = response.content.toLowerCase() == "default" || response.content.toLowerCase() == "d" ? "Ticket" : response.content;
                                let nameChecker = await Panels.findOne({ guildID: message.guild.id, ticketType: type });
                                if (nameChecker) { cancelReason(`a panel named \`${type}\`, already exists`); return i = setupNumber; }
                                embed.setTitle(type);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                                if (setupType.toLowerCase() === "simple") return i = setupNumber - 1;
                            });
                        });
                    break;
                case 7:
                    await message.channel.send(`${step} Would you like ${support.name} to get pinged when a ticket is created? (yes/no)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                pingOnTicket = response.content.toLowerCase() == "yes" || response.content.toLowerCase() == "y" ? true : false;
                                embed.addField("Ping on ticket", pingOnTicket, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 8:
                    await message.channel.send(`${step} Would you like users NOT to receive a DM, when a ticket is deleted, yes = no dm, no = dm? (yes/no)`)
                        .then(async (tsg) => {
                            if (supportID) await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                noDMTicket = response.content.toLowerCase() == "yes" || response.content.toLowerCase() == "y" ? true : false;
                                embed.addField("No DM", noDMTicket, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 9:
                    await message.channel.send(`${step} Would you like transcripts to be created when a ticket is deleted? (yes/no)`)
                        .then(async (tsg) => {
                            if (supportID) await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                transcriptOnDelete = response.content.toLowerCase() == "yes" || response.content.toLowerCase() == "y" ? true : false;
                                embed.addField("Transcript on delete", transcriptOnDelete, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 10:
                    await message.channel.send(`${step} Would you like to tickets to be named #ticket-${message.author.username} or #ticket-1? (username/number)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                nameTicket = response.content.toLowerCase() == "username" || response.content.toLowerCase() == "u" || response.content.toLowerCase() == message.author.username.toLowerCase() ? true : false;
                                embed.addField("Name Tickets", nameTicket, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 11:
                    await message.channel.send(`${step} What message would you like to send in ${channel}? (default/message)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                openTicket = response.content.toLowerCase() == "default" || response.content.toLowerCase() == "d" ? "React below to open a ticket." : response.content;
                                embed.addField("Open ticket", openTicket, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 12:
                    await message.channel.send(`${step} What message would you like to be sent when new tickets are opened? (default/message)`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                newTicket = response.content.toLowerCase() == "default" || response.content.toLowerCase() == "d" ? "You've opened a ticket, react below to close it." : response.content;
                                embed.addField("New ticket", newTicket, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 13:
                    await message.channel.send(`${step} What would you like the **close** ticket message to be? (default/message) ${configMessage}`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                closeMsg = response.content.toLowerCase() == "default" || response.content.toLowerCase() == "d" ? "The ticket was closed by {executor}" : response.content;
                                embed.addField("Ticket closed", closeMsg, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 14:
                    await message.channel.send(`${step} What would you like the **reopen** ticket message to be? (default/message) ${configMessage}`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                reopenMsg = response.content.toLowerCase() == "default" || response.content.toLowerCase() == "d" ? "The ticket was reopened by {executor}" : response.content;
                                embed.addField("Ticket reopened", reopenMsg, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 15:
                    await message.channel.send(`${step} What would you like the **delete** ticket message to be? (default/message) ${configMessage}`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                deleteMsg = response.content.toLowerCase() == "default" || response.content.toLowerCase() == "d" ? "The ticket was deleted by {executor}" : response.content;
                                embed.addField("Ticket deleted", deleteMsg, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 16:
                    await message.channel.send(`${step} What would you like the **forcefully deleted** ticket message to be? (default/message) ${configMessage}`)
                        .then(async (tsg) => {
                            await message.channel.awaitMessages(filter, { max: 1 }).then(res => {
                                const response = res.first();
                                if (response.content.toLowerCase() == "cancel") { cancelReason(cancel); return i = setupNumber; }
                                forcedeleteMsg = response.content.toLowerCase() == "default" || response.content.toLowerCase() == "d" ? "The ticket was forcefully deleted by {executor}" : response.content;
                                embed.addField("Ticket forcefully deleted ", forcedeleteMsg, true);
                                embe.edit(embed).catch(err => { }); response.delete().catch(err => { }); tsg.delete().catch(err => { });
                            });
                        });
                    break;
                case 17:
                    embed.setDescription("Final Configuration:").setColor("GREEN"); embe.edit(embed).then(async () => {
                        const newEmbed = new Discord.MessageEmbed()
                            .setTitle(`Open ${type}`)
                            .setDescription(`${openTicket}\n\nBy opening a ticket, you agree that your conversation will be recorded for legal and quality purposes.`)
                            .setFooter(reactions.footer);
                        await channel.send(newEmbed).catch(err => { }).then(async (m) => {
                            messageID = m.id;
                            await m.react("🎫").catch(err => { });
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
                                noDMTicket: noDMTicket,
                                nameTicket: nameTicket,
                                transcriptOnDelete: transcriptOnDelete,
                                topic: topic
                            });
                            await newReaction.save().catch(e => console.log(e));
                            return message.channel.send("Setup completed.");
                        });
                    });
                    break;
            }
        }
    });
}

module.exports.help = {
    name: "setup",
    aliases: ["s", "bs"],
    usage: "setup (simple/advanced)",
    description: "Setup the bot",
    perms: 3
};

module.exports.limits = {
    rateLimit: 1,
    cooldown: 10000
}