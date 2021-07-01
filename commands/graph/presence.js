const discord = require('discord.js');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');
const ms = require('ms');
const { defaultChartRenderer } = require('../../utils/globals');
const moment = require('moment');

const presence = require('../../database/influx/methods/presence');
const { max } = require('moment');
const { parseAndSendError } = require('../../utils/parse');


// {
//     data: [allOnline[allOnline.length - 1]._value, allOffline[allOffline.length - 1], allDnd[allDnd.length - 1], allIdle[allIdle.length - 1]],
//     borderColor: 'rgb(239, 141, 50)',
//     backgroundColor: 'rgba(0,0,0,0)',
//     label: 'Members',
//     yAxisID: 0
// }

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async function (message, args, client) {

        const { error, start, end } = (parseAndSendError(message, args, { help: this.help }));
        if(error) return;

       presence.get(message.guild.id, start, end)
            .then(async (data) => {
                if(!data || !data.found) 
                    if(data.start == "Invalid Date" || !data.start)
                        return message.channel.send(errorEmbed("📋 No Data", `No data found.`));
                    else 
                        return message.channel.send(errorEmbed("📋 No Data", `No data found between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\``));

                const allDnd = data.value.filter(v => v.type === 'dnd').map(v => (v._value ?? 0) >= 0 ? v._value ?? 0 : 0);
                const allIdle = data.value.filter(v => v.type === 'idle').map(v => (v._value ?? 0) >= 0 ? v._value ?? 0 : 0);
                const allOffline = data.value.filter(v => v.type === 'offline').map(v => (v._value ?? 0) >= 0 ? v._value ?? 0 : 0);
                const allOnline = data.value.filter(v => v.type === 'online').map(v => (v._value ?? 0) >= 0 ? v._value ?? 0 : 0);

                console.log(allOnline, allOffline, allIdle, allDnd)

                const buff = await defaultChartRenderer({
                    type: 'line',
                    data: {
                        labels: data.value.filter(v => v.type === 'online').map(v => moment(new Date(v._time)).format(data.format)),
                        datasets: [
                            {
                                data: allOnline,
                                borderColor: '#43b581',
                                backgroundColor: 'rgba(0,0,0,0)',
                                label: 'Online',
                                normalized: true
                            },
                            {
                                data: allOffline,
                                borderColor: '#ff0000',
                                backgroundColor: 'rgba(0,0,0,0)',
                                label: 'Offline',
                                normalized: true
                            },
                            {
                                data: allIdle,
                                borderColor: '#faa61a',
                                backgroundColor: 'rgba(0,0,0,0)',
                                label: 'Idle',
                                normalized: true
                            },
                            {
                                data: allDnd,
                                borderColor: '#f04747',
                                backgroundColor: 'rgba(0,0,0,0)',
                                label: 'DND',
                                normalized: true
                            }
                        ]
                    },

                    options: {
                        scales: {
                            y: {
                                suggestedMax: Math.max(...[...allOffline, ...allOnline, ...allDnd, ...allIdle]),
                                suggestedMin: Math.min(...[...allOffline, ...allOnline, ...allDnd, ...allIdle]),
                                stacked: false,

                                ticks: {
                                    beginAtZero: false,
                                    precision: 0,
                                },
                                gridLines: {
                                    zeroLineColor: "rgba(255, 255, 255, 0.8)",
                                    color: "rgba(255, 255, 255, 0.4)"
                                },
                                id: 0,
                                position: 'left'
                            },
                        },
                        legend: {
                            //display: false,
                            labels: {
                                fontColor: 'white',
                                fontSize: 20
                            }
                        },
                        tooltips: {
                            enabled: false
                        }
                    }
                })

                message.channel.send(
                    primaryEmbed("👤 User Presence", `Presence data between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\`.`)
                        .setImage(`attachment://graph.png`)
                        .setFooter(`💡 TIP: Run "presence help" to see more options!`)
                        .attachFiles(new discord.MessageAttachment(buff, 'graph.png')
                    )
                );
            })
            .catch(err => {
                message.channel.send(errorEmbed("❌ Unexpected Error", "There was an unexpected error while processing your request.\nPlease try again later."));
                console.error(err);
            })
    },

    cmd: "presence",
    alias: ["presencegraph", "statusgraph"],
    cooldown: 10000,
    help: `Usage: \`presence [range start] [range end]\n  ├ Range Start: starting point relative to right now (ex: -1h, -1d, -7d | default: -7d)\n  └ Range End: ending point relative to right now (ex: -30m, -1y, -10m)`,
    shortDesc: "Graphs presences."
}