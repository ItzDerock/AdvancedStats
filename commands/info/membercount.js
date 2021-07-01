const discord = require('discord.js');
const { primaryEmbed } = require('../../utils/utils');

const membercount = require('../../database/influx/methods/membercount');

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        const memberCount = message.guild.memberCount;
        
        membercount.get(message.guild.id, '-2d', '-1d', true)
            .then(data => {
                if(!data.value || !data?.value[0]?._value) 
                    return message.channel.send(primaryEmbed('👥 Member Count', `\`${memberCount}\` members`).setFooter("⚠ - No data to show comparison | 💡 - use \"membergraph\" cmd to show a graph!"))

                const oldCount = Math.ceil(data.value[0]._value);
                const down = oldCount > memberCount;

                //${oldCount == memberCount ? '🔄' : down ? '🔽' : '🔼'}
                message.channel.send(primaryEmbed('👥 Member Count', `**\`${memberCount}\` members**.\n└ ${down ? '-' : '+'}${Math.abs(memberCount - oldCount)} member(s) compared to yesterday.`)
                    .setFooter('💡 - Use "membergraph" to see a graph.'))
            })
            .catch(err => {
                console.error(err)
                message.channel.send(primaryEmbed('👥 Member Count', `\`${memberCount}\` members`).setFooter("⚠ - No data to show comparison | 💡 - use \"membergraph\" cmd to show a graph!"))
            })
    },

    cmd: "membercount",
    alias: ["members"],
    shortDesc: "Member count with comparison with other days."
}