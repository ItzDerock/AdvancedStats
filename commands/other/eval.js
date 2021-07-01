const discord = require('discord.js');
const influx = require('../../database/influx/influx');
const { primaryEmbed, errorEmbed } = require('../../utils/utils');

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        if(message.author.id != "273629350476382218") return;

        try {
            const code = args.join(" ");
            let evaled = await eval(code);
       
            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
       
            message.channel.send(primaryEmbed("✅ Eval Result", `\`\`\`js\n${clean(evaled)}\`\`\``));
        } catch (err) {
            message.channel.send(errorEmbed("⚠ Eval Error", `\`\`\`js\n${clean(err)}\n\`\`\``));
        }   
    },

    cmd: "eval",
    alias: [],
    hidden: true
}

function clean(text) {
    if (typeof text === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}
