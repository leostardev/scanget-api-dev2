const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'Brand';

const BrandSchema = new Schema({
  position: {
    type: Number,
    index: true
  },
  active: {
    type: Boolean,
    default: true
  },
  images: []
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, BrandSchema);
