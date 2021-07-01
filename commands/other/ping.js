const discord = require('discord.js');
const { primaryEmbed } = require('../../utils/utils');

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        const sent = await message.channel.send("Pinging...")
        sent.edit("", primaryEmbed("🚥 Bot Status", `Round trip latency is: \`${sent.createdTimestamp - message.createdTimestamp}ms\`\nDiscord heartbeat latency is: \`${client.ws.ping}ms\``))
    },

    cmd: "ping",
    alias: ["status"],
    shortDesc: "Bot ping."
}