const Discord = require('discord.js');
const chatActivityDB = require('../database/influx/methods/chatActivity');
const { getGuildUser } = require('../database/mongo/methods/wrappers/guildUser');

// var chatActivity = {};

module.exports = {
    /**
     * @param {Discord.Message} message
     */
    run: async message => {
        if(message.author.bot) return;
        if(!message.guild) return;

        chatActivityDB.set(message.guild.id, message.channel.id, 1);

        const guildMember = await getGuildUser(message.author, message.guild.id);
        guildMember.messageCount++;
        guildMember.save();
    },

    event: "message"
}
