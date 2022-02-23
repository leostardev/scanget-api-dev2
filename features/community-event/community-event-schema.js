const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'CommunityEvent';

const CommunityEventSchema = new Schema({
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
  images: [],
  startDate: Date,
  endDate: Date,
  active: {
    type: Boolean,
    default: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  deactivated: {
    type: Boolean,
    default: false
  },
  interestedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  weight: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, CommunityEventSchema);
