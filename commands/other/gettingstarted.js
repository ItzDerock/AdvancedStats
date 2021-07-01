const discord = require('discord.js');
const { primaryEmbed } = require('../../utils/utils');

const quickStartText =
`**Getting Started**
Once you've invited the bot, please give it a day or more to collect data.
Once it has collected data, you will be able to see graphs of the data collected.
Make sure the bot has permissions to embed messages and can also view channels you want it to collect info on.

**Graphing Data**
Select one of the graph commands in \`+help\`.
Running \`+help <command>\` will show all arguments of that command.
Arguments in [] are optional.

You will most likely see a **start** and **end** parameter.
The start parameter is the starting point of the graph.
The end parameter is the ending point of the graph.
They must also follow a format like this: \`-(days)(y/d/h/m/s)\`
Example: \`chatactivity -7d\` will graph the past seven days of chat activity.
\`membergraph -14d -7d\` will graph last week's member count.

You may also see a parameter named \`channel\`
This will allow you to specify which channel to show data for.

**Analyzing info**
Seeing graphs may be helpful, but another feature this bot offers is automatically analyzing and generating a report on your server.
This will take in data such as your channel names and past collected data and find anything you can improve on.
It will run over some checks and generate an embed summarizing its findings and what you can improve.

**Important Info**
The bot is still in its early stages and feedback is important. Please notify us of any bugs or suggestions in our discord server (\`+discord\`).`

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        message.channel.send(primaryEmbed("👑 Quick Start Guide", quickStartText));
    },

    cmd: "gettingstarted",
    alias: ["quickstart"],
    shortDesc: "Quickstart guide."
}