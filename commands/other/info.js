const discord = require('discord.js');
const { primaryEmbed } = require('../../utils/utils');

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        message.channel.send(primaryEmbed('😎 Nerdy Details about me.', 'Wow! You found this hidden command!\nI\'m written in JavaScript, using the Node.js runtime.\nFor a database, I use InfluxDB since it\'s time based management is super useful!\n\n[View my code on GitHub]()'))
    },

    cmd: "info",
    alias: ["botinfo"],
    hidden: true
}