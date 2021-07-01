const config = require('../../../config.json');
const BaseMethod = require("../baseMethod");

const method = new BaseMethod(config.database.influx.bucket, 'guild', 'boosts');

module.exports.get = function(guild, start, end) {
    return method.get(start, { 
        ends: end, 
        additionalFilters: { guild },
        createEmpty: true
    });
}

module.exports.set = function(guild, count, forceSave = false) {
    return method.set(count, { guild }, forceSave)
}