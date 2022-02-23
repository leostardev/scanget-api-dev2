const mongoose = require('mongoose');
const shortid = require('shortid');

const deepPopulate = require('mongoose-deep-populate')(mongoose);

const { Schema } = mongoose;

const TABLENAME = 'Package';

const PackageSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  description: String,
  slots: Number,
  banners: Number,
  cost: Number,
  duration: Number,
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

PackageSchema.plugin(deepPopulate);

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, PackageSchema);
