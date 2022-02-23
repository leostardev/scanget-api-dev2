const mongoose = require('mongoose');
const shortid = require('shortid');

const deepPopulate = require('mongoose-deep-populate')(mongoose);

const { Schema } = mongoose;

const TABLENAME = 'Promotion';

const PromotionSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  banner: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true
  },
  description: String,
  deal: {
    type: Schema.Types.ObjectId,
    ref: 'Deal'
  },
  startDate: Date,
  endDate: Date,
  approved: {
    type: Boolean,
    default: false
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientPackage: {
    type: Schema.Types.ObjectId,
    ref: 'ClientPackage'
  },
  reason: String,
  periods: [{
    type: Schema.Types.ObjectId,
    ref: 'Period'
  }],
}, { timestamps: true });

PromotionSchema.plugin(deepPopulate);

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, PromotionSchema);
