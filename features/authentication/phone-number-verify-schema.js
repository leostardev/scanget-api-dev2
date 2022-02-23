const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'PhoneNumberVerification';

const PhoneNumberVerification = new Schema({
  phoneNumber: {
    type: String,
    index: true
  },
  code: String,
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, PhoneNumberVerification);
