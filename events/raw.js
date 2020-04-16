const config = require("../config");
const Reactions = require("../models/reactions");
const Tickets = require("../models/ticket");

exports.run = async (client, event) => {

    if (event.t === 'MESSAGE_REACTION_ADD') {

        let reactions = await Reactions.findOne({
            channelID: event.d.channel_id
        });

        if (reactions) {
            let channel = client.channels.cache.get(reactions.channelID);
            await channel.message.fetch(reactions.messageID).then(msg => {
                let user = msg.guild.members.cache.get(event.d.user_id);
                if (user.id !== bot.user.id) {
                    let memberObj = msg.guild.members.cache.get(user.id);
                    let support = msg.guild.roles.cache.get(reactions.support);
                    if (event.t === "MESSAGE_REACTION_ADD") {
                        if(reactions.ticket) {
                            await Reactions.findOne({
                                channelID: event.d.channel_id
                            }, async (err, react) => {
                                if (err) console.log(err);
                                let tickets = await Tickets.findOne({
                                    guildID: msg.guild.id,
                                    id: memberObj.id
                                });

                                if (tickets) return memberObj.send("You've already got a ticked opened.");
                                react.ticket = react.ticket + 1;

                                msg.guild.channels.create(`ticket-${react.ticket}`, {
                                    type: "text",
                                    permissionOverwrites: [
                                        {
                                            id: support.id,
                                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
                                        },
                                        {
                                            id: msg.guild.id,
                                            deny: ["VIEW_CHANNEL"]
                                        }
                                    ]
                                }).then(c => {
                                    c.send(reactions.sendMessage);
                                });
                            });
                        };
                    };
                };
            });
        };
    };
};