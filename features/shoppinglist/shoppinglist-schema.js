const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Shoppinglist';

const ShoppinglistSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  name: {
    type: String,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family'
  },
  products: [],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, ShoppinglistSchema);
