const mongoose = require('mongoose');
const shortid = require('shortid');

const deepPopulate = require('mongoose-deep-populate')(mongoose);

const { Schema } = mongoose;

const TABLENAME = 'Receipt';

const ReceiptSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  image: [],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family'
  },
  reason: String,
  description: String,
  receipt_date: Date,
  receipt_time: String,
  retailer_info: {
    retailer: {
      type: Schema.Types.ObjectId,
      ref: 'Retailer'
    },
    shop: String,
    phone: String
  },
  receipt_id: String,
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    quantity: Number,
    amount: Number,
    barcode: String,
    description: String,
    points: Number,
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community'
    }
  }],
  savedAmount: Number,
  amountSpent: Number,
  deals: [{
    type: Schema.Types.ObjectId,
    ref: 'Deal'
  }],
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'Pending'
  },
  rejectionTag: String,
  processedAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  downloadedAt: Date
}, { timestamps: true });

ReceiptSchema.plugin(deepPopulate);

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, ReceiptSchema);
