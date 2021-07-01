const { Message } = require("discord.js");
const ms = require("ms");
const { primaryEmbed, errorEmbed } = require("./utils");

/**
 * 
 * @param {Message} message 
 * @param {string[]} args 
 * @param {Object} opts 
 * @param {Number} opts.offset
 * @param {string?} opts.defaultStart
 * @param {string?} opts.defaultEnd
 * @param {string} opts.help
 * @returns 
 */
module.exports.parseAndSendError = function(message, args, opts) {
    const parsed = module.exports.parseStartEnd(args, opts);

    if(parsed.error) {
        var embed;
        if(parsed.error === 'help') embed = primaryEmbed("🤔 Command Usage", opts.help)
        if(parsed.error === 'usage') embed = errorEmbed("❌ Incorrect Usage", opts.help)
        if(parsed.error === 'invalidRange') embed = errorEmbed("❌ Invalid Range", opts.help);
        message.channel.send(embed || errorEmbed("❌ Error whist generating error response for error.", "well that shouldn't happen"));
    }

    return parsed;
}

/**
 * 
 * @param {string[]} args 
 * @param {Object} opts 
 * @param {Number} opts.offset
 * @param {string?} opts.defaultStart
 * @param {string?} opts.defaultEnd
 */
module.exports.parseStartEnd = function(args = [], opts = { offset: 0, defaultStart: '-7d', defaultEnd: '-0d' }) {
    if(!opts.offset) opts.offset = 0;
    if(!opts.defaultStart) opts.defaultStart = '-7d';
    if(!opts.defaultEnd) opts.defaultEnd = '-0d';
    
    const start = args[0 + opts.offset] || opts.defaultStart;
    const end = args[1 + opts.offset] || opts.defaultEnd;

    if(!isNaN(end.substring(1)) || !isNaN(start.substring(1)))
        return { error: 'usage' }

    if(start.toLowerCase() === 'help')
        return { error: 'help' }

    if(
        !start.startsWith('-')
        || ms(start.substring(1)) === undefined
        || !end.startsWith('-')
        || ms(end.substring(1)) === undefined
    ) return { error: 'usage' }

    if(ms(start.substring(1)) < ms(end.substr(1)))
        return { error: 'invalidRange' }
    
    return {
        start,
        end
    }
}
