const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'CommunityHistory';

const CommunityHistorySchema = new Schema({
  community: {
    type: Schema.Types.ObjectId,
    ref: 'Community'
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
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
  mongoose.model(TABLENAME, CommunityHistorySchema);
