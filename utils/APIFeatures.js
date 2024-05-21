module.exports = class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        this.queryStr = JSON.parse(
            JSON.stringify(this.queryStr).replace(/([gl]te?)/g, '$$$1')
        );
        this.query = this.query.find(this.queryStr);

        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('createdAt _id');
        }

        return this;
    }

    fields() {
        if (this.queryStr.fields) {
            let fields = this.queryStr.fields.split(',');
            if (fields.indexOf('password') > -1) {
                fields.splice(fields.indexOf('password'), 1, '');
            }
            fields = fields.join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v -password');
        }

        return this;
    }

    paginate() {
        const limit = this.queryStr.limit || 100;
        const page = this.queryStr.page || 1;
        const skip = (page - 1) * limit;
        this.query = this.query.limit(limit).skip(skip);

        return this;
    }
};
