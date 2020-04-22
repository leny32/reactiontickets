const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");

const config = require("./config");

const client = new Discord.Client({ disableEveryone: true });
mongoose.connect(config.mongodb, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

client.login(config.token);
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.perms = new Discord.Collection();
client.limits = new Discord.Collection();
client.events = new Discord.Collection();

client.clean = async (client, text) => {
    if (text && text.constructor.name == "Promise") text = await text;
    if (typeof evaled !== "string") text = require("util").inspect(text, {depth: 0});
  
    text = text.replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203))
        .replace(client.token, "Unauthorized action");
  
    return text;
};


client.throw = async (message,errorType ,errorMessage) => {
    let embed = new Discord.MessageEmbed()
        .setTitle(`❌ | ${errorType}`)
        .setDescription(errorMessage)
        .setColor("RED")
        .setTimestamp();
    message.channel.send(embed);
};

fs.readdir(__dirname +"/commands/", (err, files) => {
    if (err) return console.log(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        client.commands.set(commandName, props);
        if (props.help.aliases) {
            props.help.aliases.forEach(alias => client.aliases.set(alias, commandName));
        };
    });
});

fs.readdir(__dirname +'/events/', (err, files) => {
    if (err) console.log(err);
    files.forEach(file => {
        let eventFunc = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, (...args) => eventFunc.run(client, ...args));
    });
});