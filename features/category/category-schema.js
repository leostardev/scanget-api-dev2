const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Category';

const CategorySchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  name: {
    type: String,
    index: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, CategorySchema);
