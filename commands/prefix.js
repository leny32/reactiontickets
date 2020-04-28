const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const config = require("../config");
const axios = require("axios");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    let { data } = await axios.post(config.apiUrl + "premiumCheck", { "guildid": message.guild.id }, {
        headers: {
            'Authorization': `Bearer ${config.storeapi}`
        }
    });

    let premium = data.data;

    if (!premium) return message.channel.send("Premium has not been bought on this server yet.");

    if (!args[0]) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${reactions.prefix}${this.help.usage}\``)

    if (args[0] === guild.prefix) return message.channel.send(`Prefix is already set to \`${reactions.prefix}\``);
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
