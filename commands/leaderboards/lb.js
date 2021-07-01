const discord = require('discord.js');
const { primaryEmbed } = require('../../utils/utils');

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        message.channel.send(primaryEmbed('📊 Leaderboard', 'There are multiple options for this command.\nIf you are looking for **most active chat users**, then use `+topmessages`.\nIf you are looking for **most active VC users**, then use `+topvoice`'))
    },

    cmd: "lb",
    alias: ["leaderboard"],
    shortDesc: "Select a leaderboard."
}