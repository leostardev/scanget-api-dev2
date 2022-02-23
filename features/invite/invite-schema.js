const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const TABLENAME = 'Invite';

const InviteSchema = new Schema({
  code: {
    type: String,
    index: true
  },
  sid: {
    type: String,
    default: shortid.generate,
  },
  active: {
    type: Boolean,
    default: true
  },
  initiator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  availedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, InviteSchema);
