const mongoose = require('mongoose');
const shortid = require('shortid');

const deepPopulate = require('mongoose-deep-populate')(mongoose);

const { Schema } = mongoose;

const TABLENAME = 'User';

const UserSchema = new Schema({
  sid: {
    type: String,
    default: shortid.generate,
    index: true
  },
  cognitoId: {
    type: String,
    index: true
  },
  username: String,
  email: String,
  phone: String,
  phoneCode: String,
  countryCode: String,
  location: String,
  role: String,
  gender: {
    type: String
  },
  referedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  nationality: String,
  age_group: String,
  favoriteDeals: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Deal'
    }
  ],
  year_of_birth: String,
  wallet: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  availedDeals: [],
  family: {
    type: Schema.Types.ObjectId,
    ref: 'Family'
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  hasUploadedReceipt: {
    type: Boolean,
    default: false
  },
  image: String,
  inviteBonusSent: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['en', 'gr'],
    default: 'en'
  },
  viewedIntro: {
    type: Boolean,
    default: false
  },
  deactivated: {
    type: Boolean,
    default: false
  },
  pushIds: [String],
  pushNotifications: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  deviceInfo: {},
  termsAndConditionsVersion: String,
  hideImageCaptureGuideline: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

UserSchema.plugin(deepPopulate);

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, UserSchema);
