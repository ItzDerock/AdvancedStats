const Discord = require('discord.js');
const Logger = require('../utils/logger');
const client = require('../index');
const retention = require('../database/influx/methods/retention');

module.exports = {
    /** @param {Discord.GuildMember} member */
    run: async (member) => {
        if(member.partial && !member.joinedTimestamp) await member.fetch();

        const uRetention = Date.now() - member.joinedTimestamp;
        retention.set(member.guild.id, uRetention);
    },

    event: "guildMemberRemove"
}