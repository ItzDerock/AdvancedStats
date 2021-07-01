const discord = require('discord.js');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');
const botMemberCount = require('../../database/influx/methods/botMemberCount');
const guildCount = require('../../database/influx/methods/guildCount');
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

        Promise.all([botMemberCount.get(start, end), guildCount.get(start, end)])
            .then(async ([botMemberCountData, guildCountData]) => {
                if((!botMemberCountData.found || !guildCountData.found) && (!botMemberCountData && !guildCountData) || (!botMemberCountData.value && !guildCountData.value)) {
                    if((botMemberCountData.start === "Invalid Date" && guildCountData.start === "Invalid Date") || (!botMemberCountData.start && !guildCountData.start))
                        return message.channel.send(errorEmbed("📋 No Data", `No data found.`));
                    else 
                        return message.channel.send(errorEmbed("📋 No Data", `No data found between \`${botMemberCountData.start.toUTCString()}\` and \`${botMemberCountData.stop.toUTCString()}\``));
                }

                const datasets = [];

                if(botMemberCountData.value) {
                    datasets.push({
                        data: botMemberCountData.value.map(v => v._value),
                        borderColor: 'rgb(239, 141, 50)',
                        backgroundColor: 'rgba(0,0,0,0)',
                        label: 'Total User Count',
                        yAxisID: 'y1'
                    })
                }

                if(guildCountData.value) {
                    datasets.push({
                        data: guildCountData.value.map(v => v._value),
                        borderColor: 'lightgreen',
                        backgroundColor: 'rgba(0,0,0,0)',
                        label: 'Guilds',
                        yAxisID: 'y2'
                    })
                }

                const buff = await defaultChartRenderer({
                    type: 'line',
                    data: {
                        labels: (botMemberCountData.value ?? guildCountData.value).map(v => moment(new Date(v._time)).format((botMemberCountData.format ?? guildCountData.format))),
                        datasets
                    },
                    options: {
                        scales: {
                            'y1': {
                                beginAtZero: false,
                                type: 'linear',
                                position: 'left',
                                ticks: {
                                    precision: 0,
                                    stepSize: 1,

                                    color: 'rgb(239, 141, 50)',
                                    callback: (v) => v + ' users'
                                }
                            },

                            'y2': {
                                beginAtZero: false,
                                type: 'linear',
                                position: 'right',
                                ticks: {
                                    precision: 0,
                                    stepSize: 1,

                                    color: 'lightgreen',
                                    callback: (v) => v + ' guilds'
                                }
                            },

                            x: {
                                ticks: {
                                    color: 'white'
                                }
                            }
                        }
                    }
                });

                message.channel.send(
                    primaryEmbed("🤖 Bot Stats", `Here's some statistics about me!`)
                        .setImage(`attachment://graph.png`)
                        .setFooter(`© 2021 Advanced Stats`)
                        .attachFiles(new discord.MessageAttachment(buff, 'graph.png')
                    )
                );
            })
            .catch(err => {
                message.channel.send(errorEmbed("❌ Unexpected Error", "There was an unexpected error while processing your request.\nPlease try again later."));
                console.error(err);
            })
    },

    cmd: "botstats",
    alias: ["stats", 'botinfo'],
    cooldown: 10000,
    help: `Usage: \`botstats\`\n  └ No optional params.`,
    shortDesc: "Bot statistics."
}

// CHARTJS v2 CONFIG
// const buff = await defaultChartRenderer({
//     type: 'line',
//     data: {
//         labels: (botMemberCountData.value ?? guildCountData.value).map(v => moment(new Date(v._time)).format((botMemberCountData.format ?? guildCountData.format))),
//         datasets
//     },
//     options: {
//         scales: {
//             x: [{
//                 id: 0,
//                 type: 'linear',
//                 position: 'left',
//                 ticks: {
//                     beginAtZero: false,
//                     precision: 0,
//                     stepSize: 1,

//                     fontColor: 'rgb(239, 141, 50)',
//                     fontSize: 18,
//                     callback: (v) => v + ' users'
//                 },
//                 gridLines: {
//                     zeroLineColor: "rgba(255, 255, 255, 0.8)",
//                     color: "rgba(255, 255, 255, 0.4)"
//                 }
//             }, {
//                 id: 1,
//                 type: 'linear',
//                 position: 'right',
//                 ticks: {
//                     beginAtZero: false,
//                     precision: 0,
//                     stepSize: 1,

//                     fontColor: 'lightgreen',
//                     fontSize: 18,
//                     callback: (v) => v + ' guilds'
//                 },
//                 gridLines: {
//                     zeroLineColor: "rgba(255, 255, 255, 0.8)",
//                     color: "rgba(255, 255, 255, 0.4)"
//                 },
                
//             }],

//             xAxes: [{
//                 id: 0,
//                 ticks: {
//                     fontColor: 'white',
//                     fontSize: 18
//                 },
//                 gridLines: {
//                     zeroLineColor: "rgba(255, 255, 255, 0.8)",
//                     color: "rgba(255, 255, 255, 0.4)"
//                 }
//             },
//             {
//                 id: 1,
//                 ticks: {
//                     fontColor: 'white',
//                     fontSize: 18
//                 },
//                 gridLines: {
//                     zeroLineColor: "rgba(255, 255, 255, 0.8)",
//                     color: "rgba(255, 255, 255, 0.4)"
//                 }
//             }]
//         },
//         legend: {
//             //display: false,
//             labels: {
//                 fontColor: 'white',
//                 fontSize: 20
//             }
            
//         },
//     }
// })