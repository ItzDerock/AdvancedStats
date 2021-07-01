const mongo = require("mongoose");

const schema = new mongo.Schema({
    userId: String,
    premiumUser: Boolean
});

module.exports = mongo.model('globalUser', schema);