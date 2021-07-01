const discord = require('discord.js');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');
const totalBoosts = require('../../database/influx/methods/totalBoosts');
const ms = require('ms');
const { defaultChartRenderer } = require('../../utils/globals');
const moment = require('moment');
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

        totalBoosts.get(message.guild.id, start, end)
            .then(async data => {
                if(!data || !data.found) 
                    if(data.start == "Invalid Date" || !data.start)
                        return message.channel.send(errorEmbed("📋 No Data", `No data found.`));
                    else 
                        return message.channel.send(errorEmbed("📋 No Data", `No data found between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\``));

                const buff = await defaultChartRenderer({
                    type: 'line',
                    data: {
                        labels: data.value.map(v => moment(new Date(v._time)).format(data.format)),
                        datasets: [{
                            data: data.value.map(v => v._value),
                            borderColor: 'rgb(239, 141, 50)',
                            backgroundColor: 'rgba(0,0,0,0)',
                            label: 'Boosts'
                        }],
                        
                    }
                })

                message.channel.send(
                    primaryEmbed("💎 Total Boosts", `The amount of boosts between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\`.`)
                        .setImage(`attachment://graph.png`)
                        .setFooter(`💡 TIP: Run "boosts help" to see more options!`)
                        .attachFiles(new discord.MessageAttachment(buff, 'graph.png')
                    )
                );
            })
            .catch(err => {
                message.channel.send(errorEmbed("❌ Unexpected Error", "There was an unexpected error while processing your request.\nPlease try again later."));
                console.error(err);
            })
    },

    cmd: "boosts",
    alias: ["boostsgraph", "boostgraph"],
    cooldown: 10000,
    help: `Usage: \`newboosts [range start] [range end]\`\n  ├ Range Start: starting point relative to right now (ex: -1h, -1d, -7d | default: -1d)\n  └ Range End: ending point relative to right now (ex: -30m, -1y, -10m)`,
    shortDesc: "Server boosts"
}