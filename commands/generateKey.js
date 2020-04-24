const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const Premium = require("../models/premium");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    if (message.author.id !== "561715927503339549") return;

    let reactions = await Reactions.findOne({
        guildID: message.guild.id
    });

    let dKey = makeKey(30);

    const newKey = new Premium({
        key: dKey
    });
    await newKey.save().catch(e => console.log(e));

    const embed = new Discord.MessageEmbed()
    .setTitle("Premium has been generated")
    .setDescription(`||${dKey}||`)
    .setColor("GREEN")
    .setFooter(reactions.footer)
    message.author.send(embed);
}

function makeKey(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports.help = {
    name: "generate",
    aliases: ["newkey", "createkey", "generatekey", "generate"],
    usage: "generate",
    description: "Generate a new premium key.",
    perms: 3
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
