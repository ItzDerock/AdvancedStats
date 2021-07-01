const discord = require('discord.js');
const { primaryEmbed } = require('../../utils/utils');
const chatActivity = require('../../database/influx/methods/chatActivity');
const membercount = require('../../database/influx/methods/membercount');
const voiceActivity = require('../../database/influx/methods/voiceActivity');
const retention = require('../../database/influx/methods/retention');
const ms = require('ms');
const presence = require('../../database/influx/methods/presence');

const possibleRuleChannelNames = ["rules", "rule", "readme", 'read-me', "important", "starting", "info"];
const possibleBotsChannelNames = ["bot", "command", "cmd"];
const possibleGeneralChannelNames = ["general", "chat", "talk", "chit", "discussion", "start"];

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        
        const allChannels = message.guild.channels.cache;
        const categories = allChannels.filter(channel => channel.type === 'category');
        const text = allChannels.filter(channel => ['news', 'text'].includes(channel.type));
        const voice = allChannels.filter(channel => channel.type === 'voice');

        const memberCount = message.guild.memberCount;

        const embed = primaryEmbed('🤔 Analyze Results', '*This is still in BETA. Results may not be accurate. Please post suggestions in our discord.*');
        var notEnoughData = false;

        // find all unused categories
        const usedCategories = new Set();
        allChannels.forEach(ch => ch.parentID ? usedCategories.add(ch.parentID) : '');
        const allUnused = categories.filter(cat => !usedCategories.has(cat.id));
        const allUnusedFormatted = allUnused.map(c => c.name).join(', ');

        if(allUnused.size > 0) embed.addField("🗑 Unused Categories", `You have ${allUnused.size} unused categories. (${allUnusedFormatted.substring(400) != allUnusedFormatted ? `${allUnusedFormatted.substring(400)}...` : allUnusedFormatted})`, true);

        // find all parent-less channels
        const noParentChannels = text.filter(ch => !ch.parent).concat(voice.filter(ch => !ch.parent));

        if(noParentChannels.size > 3) embed.addField("🗺 Parent-less Channels", `You have more than 3 channels with no parent! (${noParentChannels.size} parent-less channels). Try giving them a parent to keep the server organized.`, true);

        // find a rules channel
        const doesNotHaveRules = text.array().findIndex(ch => possibleRuleChannelNames.findIndex(n => ch.name.toLowerCase().includes(n)) != -1) === -1;
        if(doesNotHaveRules) embed.addField('📜 No Rules Channel', "I was unable to find any clearly marked rules channel. Having one even with the member screening on is helpful in-case a user forgets the rules.", true);

        // find bot channel
        const doesNotHaveBots = text.array().findIndex(ch => possibleBotsChannelNames.findIndex(n => ch.name.toLowerCase().includes(n)) != -1) === -1;
        if(doesNotHaveBots) embed.addField('🤖 No Bots Channel', "I was unable to find any clearly marked bot commands channel. Consider making an easy to find channel so people don't spam bot commands in general.", true);

        // find general channel
        const doesNotHaveGeneral = text.array().findIndex(ch => possibleGeneralChannelNames.findIndex(n => ch.name.toLowerCase().includes(n)) != -1) === -1;
        if(doesNotHaveGeneral) embed.addField('💬 No General Channel', "I was unable to find any clearly marked general channel. Consider making an easy to find channel so people don't immediately leave since they can't find where to talk.", true);

        // get chat activity
        const pastChatActivity = await chatActivity.get(message.guild.id, null, '-1d', null, true).catch(err => { notEnoughData = true });
        if(!pastChatActivity.found) notEnoughData = true;
        const badActivity = pastChatActivity.found ? Math.ceil(memberCount / 2) > pastChatActivity.value[0]?._value : true;

        if(badActivity) embed.addField("🤫 Bad Server Activity", `You have ${memberCount} members and only get ${pastChatActivity.value?.[0]?._value ?? 0} messages per hour!`, true);

        // get membercount trend
        const pastMemberCount = await membercount.get(message.guild.id, '-7d', '-1d', true).catch(err => { notEnoughData = true });
        if(!pastMemberCount.found) notEnoughData = true;
        const memberCountPercentChange = pastMemberCount.found ? (memberCount - pastMemberCount.value[0]._value) / memberCount : 0;

        if(memberCountPercentChange < -5) embed.addField("📉 Member Count Drop", `You've lost ${Math.abs(memberCountPercentChange)}% of your members within the past week!`, true);

        // get retention
        const pastRetention = await retention.get(message.guild.id, '-7d').catch(err => { notEnoughData = true });
        if(!pastRetention.found) notEnoughData = true;
        
        if(pastRetention.found && pastRetention.value < 86400000) embed.addField("🚪 Bad Retention", `Your server's average user retention is ${ms(pastRetention.value)}! Try to find a way to make people stay longer.`, true);

        // get vc activity
        const pastVoiceActivity = await voiceActivity.get(message.guild.id, null, '-7d', null, true).catch(err => { notEnoughData = true });
        if(!pastVoiceActivity.found) notEnoughData = true;
        const badVCActivity = pastVoiceActivity.found ? Math.ceil(memberCount / 4) > pastVoiceActivity.value[0]?._value : true;

        if(badVCActivity) embed.addField("🔇 Unused VCs", `You have ${memberCount} members and only get ${pastVoiceActivity.value ? pastVoiceActivity.value[0]._value ?? 0 : 0} vc joins per day!`, true);

        // find system channel
        const systemChannel = message.guild.systemChannel
        if(!systemChannel) embed.addField("📱 No System Channel", "Consider setting a system messages channel in server settings and enabling boost messages or else you may overlook someone boosting your server.", true)

        // get system channel flags
        const systemChannelFlags = message.guild.systemChannelFlags;
        if(systemChannel && systemChannelFlags.has('BOOST_MESSAGE_DISABLED')) embed.addField("🚀 No Boost Channel", 'Boost messages are disabled, consider enabling so people know when someone boosts.', true)

        // check offline/online
        const allData = await presence.get(message.guild.id, '-7d', '-0d', { getAverage: true });
        const online = allData.value.reduce((pv, cv) => pv += ['online', 'dnd', 'idle'].includes(cv.type) ? cv._value : 0, 0);
        const offline = allData.value.reduce((pv, cv) => pv += cv.type === 'offline' ? cv._value : 0, 0);

        if(offline > online) embed.addField("💤 Offline Members", "A majority of your members are usually found offline, and therefore may be less active. Try to find new members to fill in the gap.", true)

        if(embed.fields.length === 0)
            embed.addField("🎉 No Suggestions", "Woah! You're server's doing great! You've setup the server correctly, and I have no suggestions for you. Think I missed something? Please tell us in our discord server.")

        message.channel.send(embed.setFooter(notEnoughData ? "Missing data, report may be incomplete or inaccurate! | Report generated " : `Report generated `).setTimestamp())
    },

    cmd: "analyze",
    alias: ["report", "genreport", "generatereport", 'serverreport'],
    cooldown: 60000,
    help: `Usage: \`analyze\`\n  └ No optional parameters`,
    permissions: [],
    shortDesc: "Analyzes your server and displays helpful tips."
}