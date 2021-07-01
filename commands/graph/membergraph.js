const discord = require('discord.js');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');
const membercount = require('../../database/influx/methods/membercount');
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

        membercount.get(message.guild.id, start, end)
            .then(async data => {
                if(!data || !data.found) 
                    if(data.start == "Invalid Date" || !data.start)
                        return message.channel.send(errorEmbed("📋 No Data", `No data found.`));
                    else 
                        return message.channel.send(errorEmbed("📋 No Data", `No data found between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\``));

                // const start = data.start.getTime();

                // data.value.map(v => ({ data: [v._value, (new Date(v._time).getTime() - start) / 300000], label: v._value }))

                const buff = await defaultChartRenderer({
                    type: 'line',
                    data: {
                        labels: data.value.map(v => moment(new Date(v._time)).format(data.format)),
                        datasets: [{
                            data: data.value.map(v => v._value),
                            borderColor: 'rgb(239, 141, 50)',
                            backgroundColor: 'rgba(0,0,0,0)',
                            label: 'Members'
                        }],
                        
                    }
                })

                message.channel.send(
                    primaryEmbed("👥 Member Count", `The member count between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\`.`)
                        .setImage(`attachment://graph.png`)
                        .setFooter(`💡 TIP: Run "membergraph help" to see more options!`)
                        .attachFiles(new discord.MessageAttachment(buff, 'graph.png')
                    )
                );
            })
            .catch(err => {
                message.channel.send(errorEmbed("❌ Unexpected Error", "There was an unexpected error while processing your request.\nPlease try again later."));
                console.error(err);
            })
    },

    cmd: "membergraph",
    alias: ["graphmembers", "membercountgraph"],
    cooldown: 10000,
    help: `Usage: \`membergraph [range start] [range end]\`\n  ├ Range Start: starting point relative to right now (ex: -1h, -1d, -7d | default: -1d)\n  └ Range End: ending point relative to right now (ex: -30m, -1y, -10m)`,
    shortDesc: "Graphs membercount."
}