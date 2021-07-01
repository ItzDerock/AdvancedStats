const Influx = require('@influxdata/influxdb-client');
const chalk = require('chalk');
const { database: { influx: config } } = require("../../config.json");
const logger = require('./utils/influxLogger');

const influx = new Influx.InfluxDB({
    url: config.host,
    token: config.token,
});

logger.log(`InfluxDB initialized. (Connected to bucket ${chalk.blue(config.bucket)} on ${chalk.green(config.host)}) `)

module.exports = {
    influx,
    write: influx.getWriteApi(config.organization, config.bucket),
    read: influx.getQueryApi(config.organization),
    changes: false,

    _functions: {
        save: () => {
            module.exports.changes = false;

            if(config.noWrite) 
                return logger.debug("Not writing because noWrite is true.");

            if(global.prod) {
                var startTime = Date.now();
                module.exports.write.flush()
                    .then(() => logger.debug("Flushed influx changes. Took " + Date.now() - startTime + ' ms'));
            } else {
                module.exports.write.flush();
            }
        }
    }
}

// Regular saves
setInterval(() => {
    if(module.exports.changes) {
        module.exports._functions.save();
    }
}, 60 * 1000);