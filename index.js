const Discord = require("discord.js");
const client = new Discord.Client();

const fs = require('fs');
if(!fs.existsSync('./logs') || !fs.statSync('./logs').isDirectory) {
    console.log('[init] Directory ./logs not found, creating...');
    try {
        fs.mkdirSync('./logs');
        console.log('[init] ./logs created successfully. Switching loggers.')
    } catch (error) {
        console.log('[init] Failed to create ./logs folder. Please create one manually.');
        console.log(error);
        console.log('[init] Please resolve the above error or create a logs directory with proper permissions.');
        console.log('[init] This error is fatal and the bot will now stop.');
        process.exit(1);
    }
}

const config = require("./config.json");
const Logger = require("./utils/logger");

global.prod = process.env.NODE_ENV === "production";

(async () => {
    await require("./handlers/events")(client);
    await require("./handlers/commands")(client);

    require('./database/influx/influx');
    require('./database/mongo/mongo');

    Logger.log('> Logging into Discord...')
    client.login(config.token);
})();

module.exports = client