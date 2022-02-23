const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Product';

const ProductSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  name: {
    type: String,
    index: true
  },
  barcode: [],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  active: {
    type: Boolean,
    default: true
  },
  latestOffer: {
    title: {
      type: String,
      default: 'No Offer'
    },
    date: {
      type: Date,
      default: null
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: 'Deal'
    },
    periods: []
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  price: Number
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, ProductSchema);
