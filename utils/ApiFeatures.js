const tourModel = require("../model/tourModel");

class ApiFeature {
  constructor(model, cloneQuery) {
    this.cloneQuery = cloneQuery;
    this.model = model;
  }

  _filter() {
    const requestQuery = { ...this.cloneQuery };

    const excludedFiled = [
      "sort",
      "limit",
      "page",
      "select",
      "field",
      "search",
    ];

    excludedFiled.forEach((field) => delete requestQuery[field]);

    let queryStr = JSON.parse(
      JSON.stringify(requestQuery).replace(
        /\b(gte|lte|lt|gt)\b/,
        (match) => `$${match}`
      )
    );

    this.query = this.model.find(queryStr);
    return this;
  }

  _sort() {
    if (this.cloneQuery.sort) {
      this.query = this.query.sort(this.cloneQuery.sort);
    }
    return this;
  }

  _paginate() {
    if (this.cloneQuery.page) {
      const limit = this.cloneQuery.limit || 10;
      const skipNum = (this.cloneQuery.page - 1) * limit;
      this.query = this.query.skip(skipNum).limit(limit);
    }
    return this;
  }

  _limitFields() {
    if (this.cloneQuery.field) {
      const fields = this.cloneQuery.field.split(",");
      this.query = this.query.select(fields);
    } else this.query.select("-__v");
    return this;
  }

  _limit() {
    if (this.cloneQuery.limit) {
      const num = +this.cloneQuery.limit;
      this.query = this.query.limit(num);
    }
    return this;
  }
}

module.exports = ApiFeature;
