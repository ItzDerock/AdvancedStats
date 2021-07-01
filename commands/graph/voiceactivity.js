const discord = require('discord.js');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');
const voiceActivity = require('../../database/influx/methods/voiceActivity');
const voiceTime = require('../../database/influx/methods/voiceTimeSpent');
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

        Promise.all([voiceActivity.get(message.guild.id, null, start, end), voiceTime.get(message.guild.id, null, start, end)])
            .then(async ([voiceActivityData, voiceTimeData]) => {
                if((!voiceActivityData.found || !voiceTimeData.found) && (!voiceActivityData && !voiceTimeData) || (!voiceActivityData.value && !voiceTimeData.value)) {
                    if((voiceActivityData.start === "Invalid Date" && voiceTimeData.start === "Invalid Date") || (!voiceActivityData.start && !voiceTimeData.start))
                        return message.channel.send(errorEmbed("📋 No Data", `No data found.`));
                    else 
                        return message.channel.send(errorEmbed("📋 No Data", `No data found between \`${voiceActivityData.start.toUTCString()}\` and \`${voiceActivityData.stop.toUTCString()}\``));
                }

                const datasets = [];

                if(voiceActivityData.value) {
                    datasets.push({
                        data: voiceActivityData.value.map(v => v._value),
                        borderColor: 'rgb(239, 141, 50)',
                        backgroundColor: 'rgba(0,0,0,0)',
                        label: 'VC Joins',
                        yAxisID: 'y1'
                    })
                }

                var id2Label;

                if(voiceTimeData.value) {
                    const half = voiceTimeData.value.length / 2;

                    const divideBy = voiceTimeData.value.filter(v => v._value > 3600000).length > half ? 3600000 // hour
                        : voiceTimeData.value.filter(v => v._value > 60000).length > half ? 60000 // min
                        : 1000 // second

                    const type = voiceTimeData.value.filter(v => v._value > 3600000).length > half ? 'hours' // hour
                        : voiceTimeData.value.filter(v => v._value > 60000).length > half ? 'minutes' // min
                        : 'seconds' // second

                    id2Label = type;

                    datasets.push({
                        data: voiceTimeData.value.map(v => parseFloat((v._value / divideBy).toFixed(2))),
                        borderColor: 'lightgreen',
                        backgroundColor: 'rgba(0,0,0,0)',
                        label: 'Time Spent in VC (' + type + ')',
                        yAxisID: 'y2'
                    })
                }

                const buff = await defaultChartRenderer({
                    type: 'line',
                    data: {
                        labels: (voiceActivityData.value ?? voiceTimeData.value).map(v => moment(new Date(v._time)).format((voiceActivityData.format ?? voiceTimeData.format))),
                        datasets
                    },
                    options: {
                        scales: {
                            y1: {
                                type: 'linear',
                                position: 'left',
                                ticks: {
                                    beginAtZero: false,
                                    precision: 0,
                                    stepSize: 1,
            
                                    color: 'rgb(239, 141, 50)',
                                    callback: (v) => v + ' joins'
                                }
                            }, 
                            y2: {
                                type: 'linear',
                                position: 'right',
                                ticks: {
                                    beginAtZero: false,
                                    precision: 0,
                                    stepSize: 1,
            
                                    color: 'lightgreen',
                                    callback: (v) => v + id2Label.charAt(0)
                                }   
                            },

                            x: {
                                ticks: {
                                    color: 'white'
                                }
                            }
                        },
                    }
                })

                message.channel.send(
                    primaryEmbed("🎤 Voice Activity", `Total VC Joins and time spent in VCs between \`${(voiceActivityData.start ?? voiceTimeData.start).toUTCString()}\` and \`${(voiceActivityData.stop ?? voiceTimeData.stop).toUTCString()}\`.`)
                        .setImage(`attachment://graph.png`)
                        .setFooter(`💡 TIP: Run "chatactivity help" to see more options!`)
                        .attachFiles(new discord.MessageAttachment(buff, 'graph.png')
                    )
                );
            })
            .catch(err => {
                message.channel.send(errorEmbed("❌ Unexpected Error", "There was an unexpected error while processing your request.\nPlease try again later."));
                console.error(err);
            })
    },

    cmd: "voiceactivity",
    alias: ["voicegraph"],
    cooldown: 10000,
    help: `Usage: \`voiceactivity [range start] [range end]\n  ├ Range Start: starting point relative to right now (ex: -1h, -1d, -7d | default: -7d)\n  └ Range End: ending point relative to right now (ex: -30m, -1y, -10m)`,
    shortDesc: "Shows activity in voice channels."
}