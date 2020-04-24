const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const Premium = require("../models/premium");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    if (reactions.premium) return message.channel.send("Premium is already activiated on this server.");

    let dKey = args[0];

    if (!dKey) return client.throw(message, "Wrong Usage", `${config.wrongUsage} ${guild.prefix}${this.help.usage}`);

    let key = await Premium.findOne({
        key: dKey,
        claimed: false
    });

    if(!key) return message.channel.send("Invalid key");

    await Reactions.findOne({
        guildID: message.guild.id,
    }, async (err, key) => {
        if (err) console.log(err);
        key.premium = true
        await key.save().catch(e => console.log(e)); 
    });

    await Premium.findOne({
        key: dKey
    }, async (err, key) => {
        if (err) console.log(err);
        key.claimed = true
        await key.save().catch(e => console.log(e));
    });

    const embed = new Discord.MessageEmbed()
    .setTitle("Premium has been activated")
    .setColor("GREEN")
    .setFooter(reactions.footer)
    message.channel.send(embed);
}

module.exports.help = {
    name: "claim",
    aliases: ["get"],
    usage: "claim (key)",
    description: "Claim your premium key.",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
