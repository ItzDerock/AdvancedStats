const discord = require('discord.js');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');
const chatActivity = require('../../database/influx/methods/chatActivity');
const { defaultChartRenderer } = require('../../utils/globals');
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

       chatActivity.get(message.guild.id, null, start, end, false, true)
            .then(async data => {
                if(!data || !data.found) 
                    if(data.start == "Invalid Date" || !data.start)
                        return message.channel.send(errorEmbed("📋 No Data", `No data found.`));
                    else 
                        return message.channel.send(errorEmbed("📋 No Data", `No data found between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\``));


                data.value = data.value.filter(d => d._value > 0).sort((a, b) => b._value - a._value).splice(0, 5);

                const buff = await defaultChartRenderer({
                    type: 'bar',
                    data: {
                        labels: Array.from({length: data.value.length}, (_, i) => i + 1),
                        datasets: [{
                            data: data.value.map(v => v._value),
                            borderColor: 'rgb(239, 141, 50)',
                            backgroundColor: 'rgb(239, 141, 50)',
                            label: 'Messages'
                        }]
                    }
                })

                message.channel.send(
                    primaryEmbed("💬 Top Channels", `Chat messages between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\`.`)
                        .setImage(`attachment://graph.png`)
                        .setFooter(`💡 TIP: Run "activechannels help" to see more options!`)
                        .attachFiles(new discord.MessageAttachment(buff, 'graph.png'))
                        .addField("Key", data.value.map((v, i) => `${++i} <#${v.channel}>`).join(', '))
                );
            })
            .catch(err => {
                message.channel.send(errorEmbed("❌ Unexpected Error", "There was an unexpected error while processing your request.\nPlease try again later."));
                console.error(err);
            })
    },

    cmd: "activechannels",
    alias: ["channels"],
    cooldown: 10000,
    help: `Usage: \`activechannels [range start] [range end]\`\n  ├ Range Start: starting point relative to right now (ex: -1h, -1d, -7d | default: -1d)\n  └ Range End: ending point relative to right now (ex: -30m, -1y, -10m)`,
    shortDesc: "Displays what channel is most active."
}