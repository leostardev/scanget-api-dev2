const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'Donation';

const DonationSchema = new Schema({
  title: String,
  thumbnail: String,
  account_title: {
    type: String,
    default: ''
  },
  bank_name: {
    type: String,
    default: ''
  },
  iban_no: {
    type: String,
    default: ''
  },
  swift_code: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  deactivated: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, DonationSchema);
