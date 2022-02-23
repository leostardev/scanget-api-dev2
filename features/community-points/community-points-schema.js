const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'CommunityPoint';

const CommunityPointSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family'
  },
  points: {
    type: Number,
    default: 0
  },
  action: String,
  source: String,
  info: String,
  quantity: Number,
  date: Date,
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community'
  },
  meta: {}
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, CommunityPointSchema);
