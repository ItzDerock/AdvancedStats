const discord = require("discord.js");
const guildUserSchema = require("../../database/mongo/methods/schema/guildUserSchema");
const guildUser = require("../../database/mongo/methods/wrappers/guildUser");
const { defaultChartRenderer } = require("../../utils/globals");
const { primaryEmbed } = require("../../utils/utils");

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

module.exports = {
    /**
     * @param {discord.Message} message
     * @param {String[]} args
     * @param {discord.Client} client
     */
    run: async (message, args, client) => {
        const lb = await guildUserSchema
            .find({ guildId: message.guild.id })
            .sort({ messageCount: -1 })
            .limit(5)
            .exec();

        if (lb.length > 0) {
            const buff = await defaultChartRenderer({
                type: "bar",
                data: {
                    labels: lb.map(
                        (_, i) => `${++i}`
                    ),
                    datasets: [
                        {
                            data: lb.map((d) => d.get("messageCount")),
                            label: "Messages",
                        },
                    ],
                },
            });

            message.channel.send(
                primaryEmbed(
                    `Top chatters of ${monthNames[new Date().getMonth()]}`,
                    ``
                )
                    .attachFiles(new discord.MessageAttachment(buff, "bar.png"))
                    .setImage("attachment://bar.png")
                    .addField("Key", lb.map((d, i) => `${++i} <@${d.get('userId')}>`).join(', '))
            );
        } else {
            message.channel.send(
                primaryEmbed(
                    `Top chatters of ${monthNames[new Date().getMonth()]}`,
                    "No logged messages."
                )
            );
        }
    },

    cmd: "topmessages",
    alias: ["lbmsg"],
    cooldown: 10000,
    help: `Usage: \`topmessages\`\n  └ No additional options available.`,
    shortDesc: "Most active users in the server."
};
