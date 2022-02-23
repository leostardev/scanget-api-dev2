const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'Payment';

const PaymentSchema = new Schema({
  amount: {
    type: Number
  },
  month: Number,
  year: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  accountDetails: {}
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, PaymentSchema);
