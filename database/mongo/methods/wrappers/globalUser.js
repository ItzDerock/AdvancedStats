const baseWrapper = require("./baseWrapper");
const globalUserSchema = require("../schema/globalUserSchema");
const mongoose = require('mongoose');

class globalUser extends baseWrapper {

    /** @param {mongoose.Document} document */
    constructor(document) {
        super(document);
        this.document = document;
    }

    /**
     * @returns {String?}
     */
    get userId() {
        return this.document.get('userId');
    }

    /**
     * @returns {Boolean}
     */
    get premiumUser() {
        return this.document.get('premiumUser') ?? false;
    }

    set premiumUser(value) {
        if(typeof value != 'boolean') throw new TypeError(`Expected boolean got ${value}`);

        this.document.set('premiumUser', value);
    }
}

module.exports = {
    globalUser,
    
    async getGlobalUser(userId) {
        if(!userId)
            throw new TypeError(`Expected 1 argument, got none.`)

        var document = await globalUserSchema.findOne({ userId }).exec();

        if(!document) document = await globalUserSchema.create({ userId });

        return new globalUser(document);
    }
}