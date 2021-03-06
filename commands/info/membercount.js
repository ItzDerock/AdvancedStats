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
                    return message.channel.send(primaryEmbed('š„ Member Count', `\`${memberCount}\` members`).setFooter("ā  - No data to show comparison | š” - use \"membergraph\" cmd to show a graph!"))

                const oldCount = Math.ceil(data.value[0]._value);
                const down = oldCount > memberCount;

                //${oldCount == memberCount ? 'š' : down ? 'š½' : 'š¼'}
                message.channel.send(primaryEmbed('š„ Member Count', `**\`${memberCount}\` members**.\nā ${down ? '-' : '+'}${Math.abs(memberCount - oldCount)} member(s) compared to yesterday.`)
                    .setFooter('š” - Use "membergraph" to see a graph.'))
            })
            .catch(err => {
                console.error(err)
                message.channel.send(primaryEmbed('š„ Member Count', `\`${memberCount}\` members`).setFooter("ā  - No data to show comparison | š” - use \"membergraph\" cmd to show a graph!"))
            })
    },

    cmd: "membercount",
    alias: ["members"],
    shortDesc: "Member count with comparison with other days."
}