const Discord = require('discord.js');
const client = require('..');
const voiceActivityDB = require('../database/influx/methods/voiceActivity');
const voiceTimeSpentDB = require('../database/influx/methods/voiceTimeSpent');
const { getGuildUser } = require('../database/mongo/methods/wrappers/guildUser');

// var voiceActivity = {};
const vcJoinedAt = new Map();

module.exports = {
    /**
     * 
     * @param {Discord.VoiceState} oldState 
     * @param {Discord.VoiceState} newState 
     */
    run: async (oldState, newState) => {
        if(newState.member.user.bot || oldState.member.user.bot) return;
        if(!newState.member.guild || !oldState.member.guild) return;
        if(oldState.member.id != newState.member.id) return;

        if(oldState.channel && !newState.channel) {
            // someone left vc

            const joinedAt = vcJoinedAt.get(newState.member.id);
            if(!joinedAt) return;
            
            voiceTimeSpentDB.set(newState.guild.id, oldState.channel.id, Date.now() - joinedAt);
            
            const guildMember = await getGuildUser(newState.member.user, newState.guild.id);
            guildMember.voiceTime += Date.now() - joinedAt;
            guildMember.save();

        } else if(!oldState.channel && newState.channel) {
            // someone joined vc

            vcJoinedAt.set(newState.member.id, Date.now());
            voiceActivityDB.set(newState.guild.id, newState.channel.id, 1);
        }

        // if(chatActivity[`${message.guild.id}-${message.channel.id}`]) {
        //     const oldData = chatActivity[`${message.guild.id}-${message.channel.id}`];
        //     if(typeof oldData == "number")
        //         chatActivity[`${message.guild.id}-${message.channel.id}`] = oldData + 1;
        //     else 
        //         chatActivity[`${message.guild.id}-${message.channel.id}`] = 1
        // } else {
        //     chatActivity[`${message.guild.id}-${message.channel.id}`] = 1
        // }
    },

    event: "voiceStateUpdate"
}

// setInterval(() => {
//     Object.entries(voiceActivity)
//         .forEach(([key, value]) => {
//             const [guildID, channelID] = key.split('-');

//             if(!guildID || !channelID || !value || typeof value != 'number') return;

//             voiceActivityDB.set(guildID, channelID, value);
//         })
    
//     chatActivity = {};
// }, 60000);