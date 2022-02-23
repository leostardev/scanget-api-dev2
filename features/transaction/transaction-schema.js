const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Transaction';

const TransactionSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  bank_name: String,
  account_title: String,
  iban_no: String,
  swift_code: String,
  comment: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    default: 'Pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  phoneNo: String,
  dType: String
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, TransactionSchema);
