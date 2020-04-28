const Discord = require("discord.js");
const Reactions = require("../models/reactions");

exports.run = async (client, guild, message, args) => {

    let reaction = await Reactions.findOne({
        guildID: message.guild.id
    });

    const embed = new Discord.MessageEmbed()
    .setTitle("Reaction Tickets | Invite")
    .setURL("https://store.droplet.gg/reactiontickets")
    .setDescription("It is suggested to invite the bot with administrator permissions in order to bypass all permissions checks. This means that you only have to move the role over the role you are giving to make it work. Or you could use the normal invite that should have all needed permissions but does not bypass channel and other permissions.")
    .addField("Admin Invite", "Click [here](https://discordapp.com/oauth2/authorize?client_id=702920439131013190&permissions=8&scope=bot) to invite or url below\nhttps://discordapp.com/oauth2/authorize?client_id=702920439131013190&permissions=8&scope=bot")
    .addField("Normal Invite", "Click [here](https://discordapp.com/oauth2/authorize?client_id=702920439131013190&scope=bot&permissions=1342565456) to invite or url below\nhttps://discordapp.com/oauth2/authorize?client_id=702920439131013190&scope=bot&permissions=1342565456")
    .setFooter(reaction.footer);
    message.channel.send(embed);

}

module.exports.help = {
    name: "invite",
    aliases: ["inv"],
    usage: "invite",
    description: "Invite bot to your server.",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}
