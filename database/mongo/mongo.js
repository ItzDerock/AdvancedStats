const chalk = require('chalk');
const mongoose = require('mongoose');
const { database: { mongodb: config } } = require('../../config.json');
const mongoLogger = require('./utils/mongoLogger');

mongoLogger.debug(`Attempting to connect to ${chalk.blue(config.database)} at ${chalk.green(config.host)}`)

mongoose.connect(
    `mongodb://${config.username ? `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@` : ''}${config.host}/${config.database ?? ''}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    mongoLogger.log(`Connected to ${chalk.blue(config.database)} at ${chalk.green(config.host)}`);
}).catch(err => {
    mongoLogger.error(`Failed to connect to ${chalk.blue(config.database)} at ${chalk.green(config.host)}`, err);
    process.exit(1);
});