const mongoose = require('mongoose');
const shortid = require('shortid');

const deepPopulate = require('mongoose-deep-populate')(mongoose);

const { Schema } = mongoose;

const TABLENAME = 'Notification';

const NotificationSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  title: String,
  description: String,
  user: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  readBy: [
    {
      readAt: Date,
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  forAllUsers: {
    type: Boolean,
    default: false
  },
  pushNotification: Boolean,
  meta: {

  },
  dType: String,
  notificationType: String
}, { timestamps: true });

NotificationSchema.plugin(deepPopulate);

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, NotificationSchema);
