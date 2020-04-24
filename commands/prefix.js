const Discord = require("discord.js");
const Reactions = require("../models/reactions");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    if (!args[0]) return bot.throw(message, "Wrong Usage", `${config.wrongUsage} \`${reactions.prefix}${this.help.usage}\``)

    if (args[0] === gConfig.prefix) return message.channel.send(`Prefix is already set to \`${reactions.prefix}\``);
    if (args[0].length > 5) return message.channel.send("Prefix can be maximum 5 characters");

    await Reactions.findOne({
        guildID: message.guild.id
    }, async (err, react) => {
        if (err) console.log(err);
        react.prefix = args[0]
        await react.save().catch(e => console.log(e));
    });

    message.channel.send(`The prefix has been changed to \`${args[0]}\``);
}

module.exports.help = {
    name: "prefix",
    aliases: ["setprefix", "sprefix"],
    usage: "prefix (newprefix)",
    description: "Change the prefix of the bot.",
    perms: 3
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
