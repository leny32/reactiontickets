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
    message.channel.send(embed).catch(err => { })
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

setInterval(() => {
    this.postStats(client)
}, 300000);

module.exports.postStats = async function(client) {
    let botid = 1
    let guild = client.guilds.cache.size
    let members = client.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)
    let channels = client.channels.cache.size
    let ram = process.memoryUsage().heapUsed
    let totalHeap = ram.reduce((prev, heap) => prev + heap, 0);
    await axios.post("https://droplet.gg/reactiontickets/api/stats", { bot: "reactionroles", botid: botid, stats: `{ "servers": ${guild}, "members": ${members}, "channels": ${channels}, "ram": ${totalHeap} }` }, {
        headers: {
            'Authorization': `Bearer +raY,*RdtoQ9=*,!Dd0*qg*BB+euWBWmmJ,LZkb*nX!tnEv3r=t(1;sbN?I13D.Hs.8%i3PI2*yKS1Z:`
        }
    });

}