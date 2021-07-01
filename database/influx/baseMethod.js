const influx = require("./influx");
const Influx = require("@influxdata/influxdb-client");
const { queryBuilder } = require("./utils");
const ms = require("ms");
const { logger } = require("./utils/influxLogger");

/**
 * @callback additionalQueryParams
 * @param {queryBuilder} query
 * @return {queryBuilder}
 */

/**
 * @typedef {Object} baseMethodGetOpts
 * @property {{field: string, value: string}[]} additionalFilters
 * @property {additionalQueryParams} additionalQueryParams
 * @property {String} ends
 * @property {boolean} createEmpty
 */

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
 */

/**
 * @typedef {Object} getRes
 * @property {InfluxResponse[]} value
 * @property {Date} start
 * @property {Date} stop
 * @property {boolean} found
 * @property {String} format
 * 
 */

module.exports = class BaseMethod {
    /** @type {String} */
    #bucket;
    /** @type {String} */
    #measurement;
    /** @type {String} */
    #field;

    constructor(bucket, measurement, field) {
        this.#bucket = bucket;
        this.#field = field;
        this.#measurement = measurement;
    }

    set(value, tags = {}, forceSave = false) {
        const point = new Influx.Point(this.#measurement);

        for(const [key, value] of Object.entries(tags))
            point.tag(key, value)
        
        point.intField(this.#field, value);

        influx.write.writePoint(point);

        if(forceSave) {
            influx._functions.save();
        } else {
            influx.changes = true;
        }
    }

    /**
     * 
     * @param {String} start 
     * @param {baseMethodGetOpts} opts 
     * @returns {Promise<getRes>}
     */
    get(start = '-1d', opts = {}) {
        return new Promise((resolve, rej) => {
            /** @type {InfluxResponse[]} */
            var data = [];

            const startms = ms(start?.substring(1));
            const endms = ms(opts.ends?.substring(1) ?? '0d');

            const per10min = (startms - (endms ?? Date.now())) <= 3600000;
            const hourly = (startms - (endms ?? Date.now())) <= 86400000;

            var query = new queryBuilder(this.#bucket)
                .addRange(start, opts.ends)
                .addFilter('_measurement', this.#measurement)
                .addFilter('_field', this.#field)
                .toFloat();

            if(opts.additionalFilters) 
                for(const [ additionalField, additionalValue ] of Object.entries(opts.additionalFilters).filter(entry => entry[0] && entry[1])) 
                    query.addFilter(additionalField, additionalValue)

            query.aggregateWindow(per10min ? '10m' : hourly ? '1h' : '1d', 'median', opts.createEmpty ?? false);

            if(opts.additionalQueryParams) 
                query = opts.additionalQueryParams(query);

            logger.debug(query.build())

            influx.read.queryRows(query.build(), {
                next(row, tableMeta) {
                    data = data.concat(tableMeta.toObject(row));
                },
    
                error(err) {
                    rej(err);
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

        });
    }
}