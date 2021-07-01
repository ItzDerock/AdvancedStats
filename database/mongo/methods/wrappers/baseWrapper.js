class baseWrapper {

    constructor(document) {
        this.document = document;
        this.timeout;
    }

    save() {
        if(this.timeout) clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.document.save()
        }, 10000);
    }
}

module.exports = baseWrapper