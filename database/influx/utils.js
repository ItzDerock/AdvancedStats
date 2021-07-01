class queryBuilder {
    constructor(bucket) { 
        this.bucket = bucket;
        this.options = [];
    }

    /**
     * 
     * @param {String} start 
     * @param {String?} end 
     */
    addRange(start = "-7d", end) {
        this.options.push({
            type: 'range',
            params: {
                start: start,
                stop: end
            }
        });

        return this;
    }

    /**
     * 
     * @param {String} field 
     * @param {String} value 
     */
    addFilter(field, value) {
        this.options.push({
            type: 'filter',
            params: {
                fn: `(r) => r["${field}"] == "${value}"`
            }
        })

        return this;
    }

    /**
     * 
     * @param {String} every 
     * @param {'mean'} fn 
     * @param {boolean} createEmpty 
     */
    aggregateWindow(every, fn, createEmpty) {
        createEmpty = String(createEmpty)
        this.options.push({
            type: 'aggregateWindow',
            params: {
                every,
                fn,
                createEmpty
            }
        });

        return this;
    }

    yield(name) {
        this.options.push({
            type: 'yield',
            params: { name }
        });
        
        return this;
    }

    mean() {
        this.options.push({
            type: 'mean',
            params: { }
        });

        return this;
    }

    sum() {
        this.options.push({
            type: 'sum',
            params: { }
        });

        return this;
    }

    toFloat() {
        this.options.push({
            type: 'toFloat',
            params: { }
        });

        return this;
    }

    last() {
        this.options.push({
            type: 'last',
            params: { }
        });

        return this;
    }

    /**
     * @returns {String}
     */
    build() {
        return 'from(bucket: "' + this.bucket + '")'
            + '\n' + this.options.map(
                part => `  |> ${part.type}(${Object.entries(part.params).filter(([pname, pvalue]) => pname && pvalue).map(([pname, pvalue]) => `${pname}: ${pvalue}`).join(', ')})`
            ).join('\n');
    }
}

module.exports = {
    queryBuilder
}