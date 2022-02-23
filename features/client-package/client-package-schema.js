const mongoose = require('mongoose');
const shortid = require('shortid');

const deepPopulate = require('mongoose-deep-populate')(mongoose);

const { Schema } = mongoose;

const TABLENAME = 'ClientPackage';

const ClientPackageSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  package: {
    type: Schema.Types.ObjectId,
    ref: 'Package'
  },
  slots: Number,
  banners: Number,
  cost: Number,
  startDate: Date,
  endDate: Date,
  packageMeta: {},
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'Pending'
  },
  rejectionReason: String
}, { timestamps: true });

ClientPackageSchema.plugin(deepPopulate);

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, ClientPackageSchema);
