const Influx = require("@influxdata/influxdb-client");
const influx = require("../influx");
const config = require('../../../config.json');
const { queryBuilder } = require("../utils");
const ms = require("ms");

// const query = 
// `from(bucket: "${config.database.influx.bucket}")
// {RANGE}
//   |> filter(fn: (r) => r["_measurement"] == "user")
//   |> filter(fn: (r) => r["_field"] == "count")
//   |> filter(fn: (r) => r["guild"] == "{GUILD}")
//   |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)`


/**
 * @typedef {Object} InfluxResponse
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
 * @property {InfluxResponse[]} value
 * @property {Date} start
 * @property {Date} stop
 * @property {boolean} found
 * @property {String} format
 * 
 */

/**
 * 
 * @returns {Promise<parsedRetentionRes>}
 */
module.exports.get = function(start, end, getMean = false) {
    return new Promise((resolve, reject) => {
        /** @type {InfluxResponse[]} */
        var data = [];

        const startms = ms(start?.substring(1));
        const endms = ms(end?.substring(1) ?? '0d');

        const per10min = (startms - (endms ?? Date.now())) <= 3600000;
        const hourly = (startms - (endms ?? Date.now())) <= 86400000;

        const q = new queryBuilder(config.database.influx.bucket)
            .addRange(start, end)
            .addFilter('_measurement', 'bot')
            .addFilter('_field', 'guildCount')
            .toFloat()
            .aggregateWindow(per10min ? '10m' : hourly ? '1h' : '1d', 'median', false)

        if(getMean) q.mean();

        influx.read.queryRows(
            q.build()
        , {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                data = data.concat(o);
            },

            error(err) {
                reject(err);
            },

            complete() {
                if(data.length > 0) 
                    resolve({ 
                        found: true,
                        start: new Date(Math.min(...data.map(d => new Date(d._start).getTime()))), 
                        stop: new Date(Math.max(...data.map(d => new Date(d._stop).getTime()))), 
                        value: data,
                        format: per10min ? 'h:mma' : hourly ? 'ha' : 'MM/DD/YYYY'
                    });
                else 
                    resolve({
                        found: false
                    });
            }
        })
    })
}

/**
 * 
 * @param {Number} count 
 */
module.exports.set = function(count, forceSave = false) {
    if(typeof count != "number") throw TypeError("Expected number got " + typeof count + " with value: " + String(count));

    const data = new Influx.Point('bot')
        .intField('guildCount', count);

    influx.write.writePoint(data);

    if(forceSave) {
        influx._functions.save();
    } else {
        influx.changes = true;
    }
}