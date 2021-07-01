const discord = require('discord.js');
const { commands, categories } = require('../../utils/globals');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');

var fields = [];

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        if(fields.length == 0) {
            for(const [cat, catData] of categories.entries()) {
                fields.push({
                    name: `__${catData.friendlyName}__`,
                    value: commands.filter(cmd => cmd.category === cat && cmd.cmd && !cmd.isCmdAlias && !cmd.hidden).map(cmd => `\`${cmd.cmd}\` - ${cmd.shortDesc ?? "No description"}`)
                });
            }
        }

        if(!args[0]) {
            message.channel.send(
                primaryEmbed('✋ Help', "Need to know how to start using this bot? Run `+gettingstarted` for a brief tutorial!\n**Use \`+help <command>\` for more details on a command!**")
                    .addFields(fields)
                    .addField("Copyright Notice", "This bot is based off of the Advanced Stats Discord Bot's source code.\n[License](https://github.com/ItzDerock/AdvancedStats/blob/main/LICENSE)\n[Source Code](https://github.com/ItzDerock/AdvancedStats)") // This must be kept, but the format can be changed as long as it doesn't alter the meaning, as stated in the license.
                    .setFooter('⚠ This bot is in BETA. Please report bugs on our discord sever (+discord)')
            )
        } else {
            const cmd = commands.get(args[0].toLowerCase());

            if(!cmd) return message.channel.send(errorEmbed("❌ Unknown Command", "Double check your spelling!"));
            if(!cmd.help)  return message.channel.send(errorEmbed('📄 Command - ' + args[0].toLowerCase(), 'No help available!'))

            message.channel.send(primaryEmbed('📄 Command - ' + args[0].toLowerCase(), '').addField("⌨ Usage", cmd.help).addField("📛 Aliases", cmd.alias ? cmd.alias.map(a => `\`${a}\``).join(', ') : "No Aliases"));
        }
    },

    cmd: "help",
    alias: ["commands"],
    shortDesc: "this."
}