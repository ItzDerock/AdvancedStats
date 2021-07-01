const discord = require('discord.js');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');
const chatActivity = require('../../database/influx/methods/chatActivity');
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

        // PARSE ARGS ------------------------------------------------------------------------------------

        /** @type {discord.TextChannel?} */
        var channel = message.mentions.channels.first();
        
        const { error, start, end } = (parseAndSendError(message, args, { help: this.help, offset: channel ? 1 : 0 }));
        if(error) return;

        // if(args[0] == "help")
        //     return message.channel.send(primaryEmbed("🤔 Command Usage", this.help))

        // if(args.length == 1) 
        //     if(ms(args[0].substring(1))) // chatactivity -1h
        //         start = args[0]
        //     else if(message.mentions.channels.first()) // chatactivity #channel
        //         channel = message.mentions.channels.first()
        //     else
        //         return message.channel.send(errorEmbed("❌ Incorrect Usage", this.help))

        // if(args.length == 2)
        //     if(ms(args[0].substring(1)) && ms(args[1].substring(1))) // chatactivity -1h -30m
        //         start = args[0], end = args[1]
        //     else if(message.mentions.channels.first() && ms(args[1].substring(1))) // chatactivity #channel -1h
        //         start = args[1], channel = message.mentions.channels.first()
        //     else 
        //         return message.channel.send(errorEmbed("❌ Incorrect Usage", this.help))
        
        // if(args.length == 3)
        //     if(message.mentions.channels.first()
        //         && ms(args[1].substring(1))
        //         && ms(args[2].substring(1))
        //     ) start = args[1], end = args[2], channel = message.mentions.channels.first()
        //     else 
        //         return message.channel.send(errorEmbed("❌ Incorrect Usage", this.help))

        // start = start ?? '-1d';

        // if(!start.startsWith('-') || (end && !end.startsWith('-')))
        //     return message.channel.send(errorEmbed("❌ Incorrect Usage", this.help))

        // if(ms(start.substring(1)) < (ms(end?.substring(1) ?? '0d') ?? 0))
        //     return message.channel.send(errorEmbed("❌ Invalid Range", this.help))

       // END PARSING ------------------------------------------------------------------------------------

       chatActivity.get(message.guild.id, channel?.id, start, end)
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
                            data: data.value.map(v => v._value ?? 0),
                            borderColor: 'rgb(239, 141, 50)',
                            backgroundColor: 'rgba(0,0,0,0)',
                            label: 'Messages'
                        }],
                        
                    }
                })

                message.channel.send(
                    primaryEmbed("💬 Chat Activity", `Average chat messages between \`${data.start.toUTCString()}\` and \`${data.stop.toUTCString()}\`.`)
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

    cmd: "chatactivity",
    alias: ["chatgraph"],
    cooldown: 10000,
    help: `Usage: \`chatactivity [#channel] [range start] [range end]\`\n  ├ The channel to show chat activity (defaults to global). \n├ Range Start: starting point relative to right now (ex: -1h, -1d, -7d | default: -1d)\n  └ Range End: ending point relative to right now (ex: -30m, -1y, -10m)`,
    shortDesc: "Server chat activity."
}