const config = require('../../../config.json');
const BaseMethod = require("../baseMethod");

const method = new BaseMethod(config.database.influx.bucket, 'user', 'userStatus');

/**
 * 
 * @param {String} guild 
 * @param {'online'|'dnd'|'idle'|'offline'} opts.type 
 */
module.exports.get = function(guild, start, end, opts = {}) {
    var additionalQueryParams = opts.getAverage ? (q) => q.mean() : (q) => q.yield('"last"')
    
    return method.get(start, { 
        ends: end, 
        additionalFilters: { guild, type: opts.type },
        createEmpty: false,
        additionalQueryParams
    });
}

/**
 * 
 * @param {String} guild 
 * @param {'online'|'dnd'|'idle'|'offline'} type 
 * @param {Number} count 
 * @param {Boolean} forceSave 
 */
module.exports.set = function(guild, type, count, forceSave = false) {
    return method.set(count, { guild, type }, forceSave)
}