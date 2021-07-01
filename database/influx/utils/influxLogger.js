const bunyan = require('bunyan');
const bFormat = require('bunyan-format')({ outputMode: 'short' });

const logger = bunyan.createLogger({ 
    name: 'influx',
    streams: [
        { level: process.env.NODE_ENV === "production" ? 'info' : 'debug', stream: bFormat },
        { level: 'info', path: './logs/influx.log' },
        { level: 'error', path: './logs/influx.log' }
    ]
});

module.exports = {
    log: (...args) => logger.info(...args),
    error: (...args) => logger.error(...args),
    debug: (...args) => logger.debug(...args),

    logger: logger
}