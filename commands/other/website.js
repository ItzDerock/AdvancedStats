const discord = require('discord.js');
const { primaryEmbed } = require('../../utils/utils');

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        message.channel.send(primaryEmbed("", "🔜 Coming Soon!"))
    },

    cmd: "website",
    alias: ["dashboard"],
    shortDesc: "Bot website."
}