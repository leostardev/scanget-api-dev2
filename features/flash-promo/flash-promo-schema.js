const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'FlashPromo';

const FlashPromoSchema = new Schema({
  startDate: Date,
  active: {
    type: Boolean,
    default: true
  },
  endDate: Date,
  markdown: String,
  meta: {},
  deactivated: {
    default: false,
    type: Boolean
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, FlashPromoSchema);
