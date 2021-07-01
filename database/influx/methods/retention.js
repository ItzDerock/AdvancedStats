const Influx = require("@influxdata/influxdb-client");
const influx = require("../influx");
const config = require('../../../config.json');
const { queryBuilder } = require("../utils");

/**
 * @typedef {Object} retentionRes
 * @property {'_result'} result
 * @property {number} table
 * @property {String} _start
 * @property {String} _stop
 * @property {String} _time
 * @property {number} _value
 * @property {String} _field
 * @property {String} _measurement
 * @property {String} guild
 * 
 */

/**
 * @typedef {Object} parsedRetentionRes
 * @property {number} value
 * @property {Date} start
 * @property {Date} stop
 * @property {boolean} found
 * 
 */

/**
 * 
 * @param {String} guildID 
 * @param {Number} timeMS 
 * @returns {Promise<parsedRetentionRes>}
 */
module.exports.get = function(guildID, start, end) {
    return new Promise((resolve, reject) => {
        if(typeof guildID != "string") throw TypeError("Expected string got " + typeof guildID + " with value: " + String(guildID));

        /** @type {retentionRes[]} */
        var data = [];

        influx.read.queryRows(
            new queryBuilder(config.database.influx.bucket)
                .addRange(start, end)
                .addFilter('_measurement', 'user')
                .addFilter('_field', 'retention')
                .addFilter('guild', guildID)
                .aggregateWindow('5m', 'mean', false)
                .mean()
                .build()
        , {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                data = data.concat(o);
            },

            error(err) {
                reject(err);
            },

            complete() {
                if(data.length > 1) 
                    resolve({ 
                        found: true,
                        start: new Date(Math.min(...data.map(d => new Date(d._start).getTime()))), 
                        stop: new Date(Math.max(...data.map(d => new Date(d._stop).getTime()))), 
                        value: data.map(d => d._value).reduce((p, c) => p + c, 0) / data.length 
                    })
                else
                    resolve({ 
                        found: typeof data[0] != 'undefined',
                        start: new Date(data[0]?._start), 
                        stop: new Date(data[0]?._stop), 
                        value: data[0]?._value 
                    })
            }
        })
    })
}

/**
 * 
 * @param {String} guildID 
 * @param {Number} timeMS 
 */
module.exports.set = function(guildID, timeMS, forceSave = false) {
    if(typeof timeMS != "number") throw TypeError("Expected number got " + typeof timeMS + " with value: " + String(timeMS));
    if(typeof guildID != "string") throw TypeError("Expected string got " + typeof guildID + " with value: " + String(guildID));

    const data = new Influx.Point('user')
        .tag('guild', guildID)
        .intField('retention', timeMS);

    influx.write.writePoint(data);

    if(forceSave) {
        influx._functions.save();
    } else {
        influx.changes = true;
    }
}