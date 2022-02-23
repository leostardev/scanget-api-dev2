const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Deal';

const DealSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  title: String,
  active: {
    type: Boolean,
    default: true
  },
  description: String,
  image: String,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    default: 1
  },
  startDate: Date,
  endDate: Date,
  conditions: String,
  dType: String,
  savingAmount: Number,
  otherSavings: [{
    retailer: {
      type: Schema.Types.ObjectId,
      ref: 'Retailer'
    },
    shop: String,
    amount: Number
  }],
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
  limited: {
    type: Boolean,
    default: false
  },
  clientConditions: String,
  maxItems: Number,
  itemsLeft: Number,
  availedItems: Number,
  periods: [{
    type: Schema.Types.ObjectId,
    ref: 'Period'
  }],
  rejected: {
    type: Boolean,
    default: false
  },
  deactivated: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    default: 0
  },
  thumbnail: String,
  promoCode: String,
  savingType: {
    type: String,
    default: 'amount'
  },
  savedPercent: Number

}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, DealSchema);
