const baseWrapper = require("./baseWrapper");
const guildUserSchema = require("../schema/guildUserSchema");
const mongoose = require('mongoose');
const { User } = require("discord.js");

class guildUser extends baseWrapper {

    /** @param {mongoose.Document} document */
    constructor(document) {
        super(document)
        this.document = document;
    }

    set tag(value) {
        this.document.set('userTag', value)
    }

    /**
     * @returns {String?}
     */
    get guildId() {
        return this.document.get('guildId');
    }

    /**
     * @returns {String?}
     */
     get userId() {
        return this.document.get('userId');
    }

    /**
     * @returns {Number}
     */
    get messageCount() {
        return this.document.get('messageCount') ?? 0;
    }

    set messageCount(value) {
        if(isNaN(value)) throw new TypeError(`Expected number got ${value}`);

        this.document.set('messageCount', parseInt(value));
    }

    /**
     * @returns {Number}
     */
     get voiceTime() {
        return this.document.get('voiceTime') ?? 0;
    }

    set voiceTime(value) {
        if(isNaN(value)) throw new TypeError(`Expected number got ${value}`);

        this.document.set('voiceTime', parseInt(value));
    }
}

module.exports = {
    guildUser,

    /**
     * 
     * @param {User} user 
     * @param {String} guildId 
     * @returns 
     */
    async getGuildUser(user, guildId) {
        if(!user || !guildId)
            throw new TypeError(`Expected 2 arguments, got ${[userId, guildId].filter(x => x).length}.`)

        var document = await guildUserSchema.findOne({ guildId, userId: user.id }).exec();

        if(!document) document = await guildUserSchema.create({ userId: user.id, tag: user.tag, guildId });

        if(document.get('userTag') != user.tag) await document.set('userTag', user.tag).save(); // await save to prevent double saves. (mongodb doesn't like that!)

        return new guildUser(document);
    }
}

const schedule = require('node-schedule');

// every month reset user msg count and voice time spent
schedule.scheduleJob('0 0 1 * *', () => {
    guildUserSchema.updateMany({}, { messageCount: 0, voiceTime: 0 });
});