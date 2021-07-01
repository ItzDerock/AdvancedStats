const Discord = require('discord.js');
const { commands } = require('../utils/globals');
const client = require('..');
const config = require('../config.json');
const { errorEmbed } = require('../utils/utils');
const ms = require('ms');
const { getGlobalUser } = require('../database/mongo/methods/wrappers/globalUser');

const cooldowns = new Map();

module.exports = {
    /**
     * @param {Discord.Message} message
     */
    run: async message => {
        if(!message.guild) return;
        if(!message.content.startsWith(config.prefix)) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        const cmd = commands.get(command);
        if(!cmd) return;

        /** @type {Discord.Permissions} */
        const botPerms = message.channel.permissionsFor(client.user);

        if(!botPerms.has("SEND_MESSAGES"))
            return message.author.send(errorEmbed("❌ Missing Permissions", "I cannot send messages in that channel!\nMore info about required permissions can be found [here](https://wiki.advancedstats.xyz/en/home#getting-started)")).catch(err => {});

        if(!botPerms.has("EMBED_LINKS"))
            return message.channel.send("**❌ Missing Permissions:** I am missing the `EMBED_LINKS` permission!\nMore info about required permissions can be found at https://wiki.advancedstats.xyz/en/home#getting-started")

        if(!botPerms.has('ATTACH_FILES')) 
            return message.channel.send(errorEmbed("❌ Missing Permissions", "I am missing the `ATTACH_FILES` permission. This is required as I show data via graphs using images.\nMore info about required permissions can be found [here](https://wiki.advancedstats.xyz/en/home#getting-started)"))

        if(cmd.permissions) 
            for(const permission of cmd.permissions)
                if(!message.member.hasPermission(permission)) return message.channel.send(errorEmbed("❌ No Permission", "You are lacking the required permission to perform this!"))

        const globalUser = await getGlobalUser(message.author.id);

        if(cmd.cooldown) {
            if(cooldowns.has(`${message.member.id}-${command}`)) {
                const cd = cooldowns.get(`${message.member.id}-${command}`);

                if((message.createdTimestamp - cd) <  cmd.cooldown) 
                    return message.channel.send(errorEmbed("❌ Command on cooldown", `Please wait ${ms(cmd.cooldown - (message.createdTimestamp - cd), { long: true })} before executing this command.`));
                else 
                    cooldowns.set(`${message.member.id}-${command}`, message.createdTimestamp)
            } else 
                cooldowns.set(`${message.member.id}-${command}`, message.createdTimestamp)
        }

        cmd.run(message, args, client)
    },

    event: "message"
}