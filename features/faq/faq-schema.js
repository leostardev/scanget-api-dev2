const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'FAQ';

const FAQSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  question: String,
  answer: String,
  language: {
    type: String,
    enum: ['en', 'gr'],
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, FAQSchema);
