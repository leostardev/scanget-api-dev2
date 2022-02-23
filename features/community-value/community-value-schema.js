const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'CommunityValue';

const CommunityValueSchema = new Schema({
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
  active: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, CommunityValueSchema);
