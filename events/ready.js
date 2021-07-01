const Discord = require('discord.js');
const Logger = require('../utils/logger');
const client = require('../index');
const membercount = require('../database/influx/methods/membercount');
const gCount = require('../database/influx/methods/guildCount');
const botMemberCount = require('../database/influx/methods/botMemberCount');
const totalBoosts = require('../database/influx/methods/totalBoosts');
const presence = require('../database/influx/methods/presence');
const logger = require('../utils/logger');

var statusRotation = 0;

module.exports = {
    run: async () => {
        Logger.log(`Logged in as ${client.user.username}`)

        updateStats();
        setInterval(updateStats, 10 * 60 * 1000);

        rotateStatus();
        setInterval(rotateStatus, 60000);
    },

    event: "ready"
}

function updateStats() {
    client.guilds.cache.forEach(guild => {
        if(guild.available) {
            membercount.set(guild.id, guild.memberCount ?? 0);
            totalBoosts.set(guild.id, guild.premiumSubscriptionCount ?? 0);

            const actualMembers = [...new Set(guild.members.cache.array().map(m => m.id))]
            if(actualMembers.length != guild.members.cache.size) console.log(actualMembers.length, guild.members.cache.size);
            
            presence.set(guild.id, 'online', guild.members.cache.filter(user => user.presence.status == "online").size ?? 0);
            presence.set(guild.id, 'dnd', guild.members.cache.filter(user => user.presence.status == "dnd").size ?? 0);
            presence.set(guild.id, 'idle', guild.members.cache.filter(user => user.presence.status == "idle").size ?? 0);
            presence.set(guild.id, 'offline', guild.members.cache.filter(user => user.presence.status == "offline").size ?? 0);
        } else {
            logger.log(`Guild ${guild.name} (${guild.id}) is currently unavailable.`)
        }
    });

    gCount.set(client.guilds.cache.size);
    botMemberCount.set(client.guilds.cache.reduce((a, g) => a + g.memberCount, 0));
}

function rotateStatus() {
    switch(++statusRotation) {
        case 1:
            client.user.setPresence({
                status: 'online',
                activity: {
                    type: "STREAMING",
                    name: "graphs to " + client.guilds.cache.size + " guilds. | +help",
                    url: 'https://twitch.tv/derockgamer'
                }
            });
            break;

        case 2:
            client.user.setPresence({
                status: 'online',
                activity: {
                    type: "PLAYING",
                    name: "with graphs on " + client.guilds.cache.size + " guilds. | +help",
                    url: 'https://twitch.tv/derockgamer'
                }
            });
            break;

        case 3:
            client.user.setPresence({
                status: 'online',
                activity: {
                    type: "WATCHING",
                    name: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0) + " users. | +help",
                    url: 'https://twitch.tv/derockgamer'
                }
            });
            break;

        default:
            statusRotation = 0;

            client.user.setPresence({
                status: 'online',
                activity: {
                    type: "WATCHING",
                    name: "statistics on " + client.guilds.cache.size + " guilds. | +help"
                }
            });
            break;
    }
}