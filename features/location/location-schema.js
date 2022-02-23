const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'Location';

const LocationSchema = new Schema({
  name: {
    type: String,
    index: true
  },
  active: {
    type: Boolean,
    default: true
  },
  language: String
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, LocationSchema);
