const Influx = require("@influxdata/influxdb-client");
const influx = require("../influx");
const config = require('../../../config.json');
const { queryBuilder } = require("../utils");
const ms = require("ms");

// const query = 
// `from(bucket: "${config.database.influx.bucket}")
// {RANGE}
//   |> filter(fn: (r) => r["_measurement"] == "message")
//   |> filter(fn: (r) => r["_field"] == "sent")
//   |> filter(fn: (r) => r["guild"] == "{GUILD}")
//   |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
//   |> mean()`


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
 * 
 */

/**
 * 
 * @param {String} guildID 
 * @returns {Promise<parsedRetentionRes>}
 */
module.exports.get = function(guildID, channelID, start, end, mean = false, sum = false) {
    return new Promise((resolve, reject) => {
        if(typeof guildID != "string") throw TypeError("Expected string got " + typeof guildID + " with value: " + String(guildID));

        /** @type {InfluxResponse[]} */
        var data = [];

        const query = new queryBuilder(config.database.influx.bucket)
            .addRange(start, end)
            .addFilter('_measurement', 'message')
            .addFilter('_field', 'sent')
            .addFilter('guild', guildID)
            
        if(channelID) 
            if(Array.isArray(channelID))
                for(const channel of channelID) query.addFilter('channel', channel);
            else
                query.addFilter('channel', channelID);

        const startms = ms(start?.substring(1));
        const endms = ms(end?.substring(1) ?? '0d');

        const per10min = (startms - (endms ?? Date.now())) <= 3600000;
        const hourly = (startms - (endms ?? Date.now())) <= 86400000;

        query.aggregateWindow(per10min ? '10m' : hourly ? '1h' : '1d', 'sum', true);

        if(mean) query.mean();
        if(sum) query.sum();

        influx.read.queryRows(
            query.build()
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
 * @param {String} guildID 
 * @param {Number} count 
 */
module.exports.set = function(guildID, channel, count, forceSave = false) {
    if(typeof count != "number") throw TypeError("Expected number got " + typeof count + " with value: " + String(count));
    if(typeof guildID != "string") throw TypeError("Expected string got " + typeof guildID + " with value: " + String(guildID));

    const data = new Influx.Point('message')
        .tag('guild', guildID)
        .tag('channel', channel)
        .intField('sent', count);

    influx.write.writePoint(data);

    if(forceSave) {
        influx._functions.save();
    } else {
        influx.changes = true;
    }
}