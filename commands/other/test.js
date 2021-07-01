const discord = require('discord.js');
const { defaultChartRenderer } = require('../../utils/globals');
const { primaryEmbed } = require('../../utils/utils');

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        const buff = await defaultChartRenderer({
            type: 'matrix',
            data: {
                datasets: [{
                    label: 'My Matrix',
                    data: [
                        { x: 1, y: 1, v: 11 },
                        { x: 2, y: 2, v: 22 },
                        { x: 3, y: 3, v: 33 }
                    ],
                    backgroundColor: function(ctx) {
                        var value = ctx.dataset.data[ctx.dataIndex].v;
                        var alpha = (value - 5) / 40;
                        return `rgba(0,255,0,${alpha})`
                    },
                    width: function(ctx) {
                        var a = ctx.chart.chartArea;
                        return (a.right - a.left) / 3.5;
                    },
                    height: function(ctx) {
                        var a = ctx.chart.chartArea;
                        return (a.bottom - a.top) / 3.5;
                    }
                }]
            },
        })

        message.channel.send(new discord.MessageAttachment(buff, 'matrix.png'))
    },

    cmd: "test",
    alias: [""],
    shortDesc: "test."
}