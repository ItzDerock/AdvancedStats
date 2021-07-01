const Discord = require('discord.js');
const { primaryEmbed } = require('../utils/utils');

module.exports = {
    /**
     * @param {Discord.Guild} guild
     */
    run: async guild => {
        guild.owner
            .send(primaryEmbed("👋 Thanks for adding me!", 'I\'ll start gathering data asap!\nA quickstart guide is available by running `+gettingstarted`.\nOtherwise, you can browse through my commands with `+help`.\nNote: Commands can only be ran in a guild channel. They will not work in DMs'))
            .catch(err => {})
    },

    event: "guildCreate"
}
