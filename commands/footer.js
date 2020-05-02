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

    let newfoot = args.join(" ").substring(0, 128);

    if (!premium) return message.channel.send("Premium has not been bought on this server yet.");

    if (!newfoot) return client.throw(message, "Wrong Usage", `${config.wrongUsage} \`${reactions.prefix}${this.help.usage}\``)

    if (newfoot === guild.footer) return message.channel.send(`Prefix is already set to \`${reactions.prefix}\``);

    await Reactions.findOne({
        guildID: message.guild.id
    }, async (err, react) => {
        if (err) console.log(err);
        react.footer = newfoot
        await react.save().catch(e => console.log(e));
    });

    message.channel.send(`The footer has been changed to \`${newfoot}\``).catch(err => { });
}

module.exports.help = {
    name: "footer",
    aliases: ["setfooter", "sfooter"],
    usage: "footer (new footer)",
    description: "Change the footer of the bot embeds.",
    perms: 3
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
