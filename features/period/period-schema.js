const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Period';

const PeriodSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  description: String,
  startDate: Date,
  endDate: Date,
  year: Number,
  month: String,
  month_no: Number,
  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, PeriodSchema);
