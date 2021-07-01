const discord = require('discord.js');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');
const retention = require('../../database/influx/methods/retention');
const ms = require('ms');
const { parseAndSendError } = require('../../utils/parse');

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async function (message, args, client) {

        const { error, start, end } = (parseAndSendError(message, args, { help: this.help }));
        if(error) return;

        retention.get(message.guild.id, start, end)
            .then(data => {
                if(!data || !data.found) 
                    if(data.start == "Invalid Date")
                        return message.channel.send(errorEmbed("📋 No Data", `No data found.`));
                    else 
                        return message.channel.send(errorEmbed("📋 No Data", `No data found between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\``));

                message.channel.send(primaryEmbed("⏰ User Retention", `The average user retention between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\` is ${ms(data.value, { long: true })}`));
            })
            .catch(err => {
                message.channel.send(errorEmbed("❌ Unexpected Error", "There was an unexpected error while processing your request.\nPlease try again later."));
                console.error(err);
            })
    },

    cmd: "retention",
    alias: ["userretention"],
    cooldown: 60000,
    help: `Usage: \`retention [range start] [range end]\`\n  ├ Range Start: starting point relative to right now (ex: -1h, -1d, -7d | default: -7d)\n  └ Range End: ending point relative to right now (ex: -30m, -1y, -10m)`,
    shortDesc: "Shows average user retention."
}