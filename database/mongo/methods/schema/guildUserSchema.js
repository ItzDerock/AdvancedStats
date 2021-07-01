const mongo = require("mongoose");

const schema = new mongo.Schema({
    guildId: String,
    userId: String,
    userTag: String,

    messageCount: Number,
    voiceTime: Number
});

module.exports = mongo.model('guildUser', schema);