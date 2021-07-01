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
        const raw = await guildUserSchema
            .find({ guildId: message.guild.id })
            .sort({ voiceTime: -1 })
            .limit(5)
            .exec();

        const lb = raw.map(d => new guildUser.guildUser(d));

        if (lb.length > 0) {
            const half = lb.length / 2;

            const divideBy = lb.filter(v => v.voiceTime > 3600000).length > half ? 3600000 // hour
                : lb.filter(v => v.voiceTime > 60000).length > half ? 60000 // min
                : 1000 // second

            const type = lb.filter(v => v.voiceTime > 3600000).length > half ? 'hours' // hour
                : lb.filter(v => v.voiceTime > 60000).length > half ? 'minutes' // min
                : 'seconds' // second

            const buff = await defaultChartRenderer({
                type: "bar",
                data: {
                    labels: lb.map(
                        (d, i) =>
                            `${++i}`
                    ),
                    datasets: [
                        {
                            data: lb.map((d) => d.voiceTime / divideBy),
                            borderColor: "rgb(239, 141, 50)",
                            backgroundColor: "rgb(239, 141, 50)",
                            label: "Time in VC (" + type + ")",
                        },
                    ],
                },
            });

            message.channel.send(
                primaryEmbed(
                    `Top VC Users of ${monthNames[new Date().getMonth()]}`,
                    ``
                )
                    .attachFiles(new discord.MessageAttachment(buff, "bar.png"))
                    .setImage("attachment://bar.png")
                    .addField("Key", lb.map((d, i) => `${++i} <@${d.userId}>`).join(', '))
            );
        } else {
            message.channel.send(
                primaryEmbed(
                    `Top VC Users of ${monthNames[new Date().getMonth()]}`,
                    "No logged VC joins."
                )
            );
        }
    },

    cmd: "topvoice",
    alias: ["lbvoice"],
    cooldown: 10000,
    help: `Usage: \`topvoice\`\n  └ No additional options available.`,
    shortDesc: "Most active users when it comes to using voice channels."
};
