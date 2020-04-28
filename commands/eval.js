const Discord = require("discord.js");
const Reactions = require("../models/reactions");
const Tickets = require("../models/tickets");
const config = require("../config");

exports.run = async (client, guild, message, args) => {

    if (!config.admins.includes(message.author.id)) return;

    if (!args[0]) return message.channel.send("Missing arguments!")
    const code = args.join(" ");
    try {
      const evaluat = async (c) => eval(c);
      const evaled = await evaluat(code);
      const clean = await client.clean(client, evaled);
  
      const MAX_CHARS = 3 + 2 + clean.length + 3;
      if (MAX_CHARS > 1500) {
        return message.channel.send("Output :", {
          files: [{
            attachment: Buffer.from(clean),
            name: "eval.txt"
          }]
        });
      }
  
      message.channel.send(`Input:\`\`\`js\n${code}\n\`\`\`\nOutput:\`\`\`js\n${clean}\n\`\`\``);
    } catch (err) {
      message.channel.send(`Input:\`\`\`js\n${code}\n\`\`\`\nOutput:\`\`\`xl\n${err}\n\`\`\``);
    }
  
}

module.exports.help = {
    name: "eval",
    aliases: ["ev"],
    usage: "eval (thing)",
    description: "Evaluate",
    perms: 0
};

module.exports.limits = {
    rateLimit: 5,
    cooldown: 5000
}