const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'CommunityProduct';

const CommunityProductSchema = new Schema({
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community'
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  title: String,
  description: String,
  barcode: String,
  images: [],
  variations: [],
  nutritionInfo: {},
  healthInfo: String,
  active: {
    type: Boolean,
    default: true
  },
  points: {
    type: Number,
    default: 0
  },
  approved: {
    type: Boolean,
    default: false
  },
  deactivated: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, CommunityProductSchema);
