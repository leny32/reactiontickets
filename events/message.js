const Reactions = require("../models/reactions");
const Tickets = require("../models/tickets");
const Panels = require("../models/panels");
const config = require('../config')
const Discord = require("discord.js");

exports.run = async (client, message) => {
    if (message.author.bot) return;
    if (message.channel.type == "dm") return message.channel.send(`⛔ | Cannot execute commands via DMs.`).catch(err => { })

    let guild;
    guild = await Reactions.findOne({
        guildID: message.guild.id
    });
    if (!guild) {
        guild = new Reactions({
            guildID: message.guild.id
        });
        await guild.save().catch(e => console.log(e));
    };

    if (message.mentions.members.first() && message.mentions.members.first().id == client.user.id) message.channel.send(`The prefix for this server is \`${guild.prefix}\`\n> For more info please use \`${guild.prefix}info\``).catch(err => { })
    
    if (message.content.toLowerCase().startsWith(guild.prefix)) {

        let messageArray = message.content.split(" ");
        let cmd = messageArray[0].toLowerCase();
        let args = messageArray.slice(1);

        let commandfile = client.commands.get(cmd.slice(guild.prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(guild.prefix.length)));
        if (!commandfile) return;
        if (!message.guild.me.hasPermission("SEND_MESSAGES")) return;

        let aName = commandfile.help.name;

        if (commandfile.limits) {
            const current = client.limits.get(`${aName}-${message.author.id}`);

            if (!current) client.limits.set(`${aName}-${message.author.id}`, 1);
            else {
                if (current >= commandfile.limits.rateLimit) return message.channel.send("You're being ratelimited.");
                client.limits.set(`${aName}-${message.author.id}`, current + 1);
            }

            setTimeout(() => {
                client.limits.delete(`${aName}-${message.author.id}`);
            }, commandfile.limits.cooldown);
        }

        let aPerms = commandfile.help.perms;

        if (aPerms === 1) {
            if (!message.member.hasPermission("MANAGE_MESSAGES")) return client.throw(message, "Missing Permission", `${config.missingperms} | Required \`MANAGE_MESSAGES\``);
        } else if (aPerms === 2) {
            if (!message.member.hasPermission("MANAGE_GUILD")) return client.throw(message, "Missing Permission", `${config.missingperms} | Required \`MANAGE_GUILD\``);
        } else if (aPerms === 3) {
            if (!message.member.hasPermission("ADMINISTRATOR")) return client.throw(message, "Missing Permission", `${config.missingperms} | Required \`ADMINISTRATOR\``);
        }

        commandfile.run(client, guild, message, args);
        //client.channels.cache.get(config.channels.commandsLog).send(`${message.author.tag} \`[${message.author.id}]\` used **${cmd.slice(guild.prefix.length)}** in ${message.guild.name} \`[${message.guild.id}]\` \|\|${message.content}\|\|`)

    }
    let ticket = await Tickets.findOne({
        channelID: message.channel.id
    });

    if (ticket && ticket.ticketTopic === "none") {
        if (ticket.userID !== message.author.id) return;
        let panel = await Panels.findOne({
            guildID: message.guild.id,
            ticketType: ticket.ticketType
        });
        if (panel && !panel.topic) return;

        await Tickets.findOne({
            channelID: message.channel.id
        }, async (err, ticket) => {
            if (err) console.log(err);
            ticket.ticketTopic = message.content.substring(0, 256);
            ticket.save().catch(e => console.log(e));
            message.delete();
            message.channel.setTopic(message.content.substring(0, 256)).catch(err => { })
        });
    }
}
