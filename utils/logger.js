// const chalk = require("chalk");
// const utils = require("./utils")

// module.exports = {
//     log(message) {
//         const chunks = message.split('\n');

//         for (const chunk of chunks) 
//             process.stdout.write(`${chalk.blueBright(`[${this.formatDate()}]`)} ${chalk.green("[LOG]")} ${chunk}\n`)
//     },

//     error(message) {
//         const chunks = message.split('\n');

//         for (const chunk of chunks) 
//             process.stdout.write(`${chalk.blueBright(`[${this.formatDate()}]`)} ${chalk.red("[ERR]")} ${chalk.redBright(chunk)}\n`)
//     },

//     formatDate(date = new Date()) {
//         return date.toISOString()
//             .replace(/T/, ' ')
//             .replace(/\..+/, '');
//     }
// }

const bunyan = require('bunyan');
const bFormat = require('bunyan-format')({ outputMode: 'short' });

const logger = bunyan.createLogger({ 
    name: 'discord',
    streams: [
        { level: process.env.NODE_ENV === "production" ? 'info' : 'debug', stream: bFormat },
        { level: 'info', path: './logs/discord.log' },
        { level: 'error', path: './logs/discord.log' }
    ]
});

module.exports = {
    log: (...args) => logger.info(...args),
    error: (...args) => logger.error(...args),
    debug: (...args) => logger.debug(...args),

    logger: logger
}