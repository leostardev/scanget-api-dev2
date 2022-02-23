const mongoose = require('mongoose');
const shortid = require('shortid');
const { Schema } = mongoose;
const TABLENAME = 'Community';

const CommunitySchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  name: {
    type: String
  },
  approved: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  deactivated: {
    type: Boolean,
    default: false
  },
  permissions: [],
  description: String,
  images: [],
  weight: {
    type: Number,
    default: 0
  },
  pointsPerEuro: {
    type: Number,
    default: 1
  },
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, CommunitySchema);
