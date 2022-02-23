const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'WalletTransaction';

const WalletTransactionSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  dType: String,
  description: String,
  meta: {},
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family'
  },
  amount: {
    type: Number,
    default: 0
  },
  isCredited: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, WalletTransactionSchema);
