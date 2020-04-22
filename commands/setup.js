const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    if (!args[0] && !args[1] && !args[2]) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${guild.prefix}${this.help.usage}\``);

    let guildID = message.guild.id;

    const reactions = Reactions.findOne({
        guildID: guildID
    });

    let channelID;
    if (message.mentions.channels.first()) channelID = message.mentions.channels.first().id;
    else if (message.guild.channels.cache.get(args[0])) channelID = args[0];
    else return message.channel.send("Couldn't find channel.");
    let channel = client.channels.cache.get(channelID);

    let messageID;

    let supportID;
    if (message.mentions.roles.first()) supportID = message.mentions.roles.first().id;
    else if (message.guild.roles.cache.get(args[1])) supportID = args[1];
    else return message.channel.send("Couldn't find role.");

    let embedMessage;
    if (args.slice(2)) embedMessage = args.slice(2).join(" ").substring(0, 256);
    else return message.channel.send("You have to provide a message.");

    const embed = new Discord.MessageEmbed()
        .setTitle("Open Ticket")
        .setDescription(embedMessage)
        .setFooter("Reaction Tickets");
    await channel.send(embed).then(msg => {
        
        messageID = msg.id;
        msg.react("🎫");
    });
    
    if (reactions) {

        await Reactions.findOne({
            guildID: guildID
        }, async (err, react) => {
            if (err) console.log(err);
            react.channelID = channelID;
            react.messageID = messageID;
            react.supportID = supportID;

            await react.save().catch(e => console.log(e));
        });

    } else if (!reactions) {
        const newReaction = new Reactions({
            guildID: guildID,
            channelID: channelID,
            messageID: messageID,
            supportID: supportID
        });
        await newReaction.save().catch(e => console.log(e));
    };

}

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