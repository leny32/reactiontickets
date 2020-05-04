const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const config = require("../config");
const axios = require("axios");

exports.run = async (client, guild, message, args) => {

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    if (config.admins.includes(message.author.id)) {

        if (!args[0] || !args[1] || !args[2]) return message.reply("Please follow the fucking format useless lenny **rt!generate [number of keys] [amount (time)] [value (time)]**").catch(err => { })

        let amount = args[0]
        let length = args[1] + " " + args[2];

        let response = await axios.post(`https://store.droplet.gg/api/genKey/`, { "length": length, "amount": amount, "bot": "reactiontickets" },
            {
                headers: {
                    'Authorization': `Bearer ${config.genKey}`
                }
            });
        message.reply({ embed: new Discord.MessageEmbed().setTitle("Keys").setDescription(response.data.key.join("\n")).setFooter(reactions.footer) }).catch(err => { })
    } else {
        return message.reply("NOPE").catch(err => { });
    }
}

module.exports.help = {
    name: "mass",
    aliases: ["gen"],
    usage: "mass",
    description: "Generate a new premium key.",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
