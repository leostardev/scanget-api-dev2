const mongoose = require('mongoose');

const { Schema } = mongoose;

const TABLENAME = 'Setting';

const SettingSchema = new Schema({
  inviteAcceptorBonus: {
    type: Number,
    default: 0
  },
  inviteCreatorBonus: {
    type: Number,
    default: 0
  },
  termsAndConditions: {
    type: String,
    default: ''
  },
  notificationTypes: [],
  androidAppVersion: String,
  androidBuildVersion: String,
  iosAppVersion: String,
  iosBuildVersion: String,
  androidReviewAppVersion: String,
  androidReviewAppBuildVersion: String,
  iosReviewAppVersion: String,
  iosReviewAppBuildVersion: String,
  redeemDate: Date,
  pointsPerEuro: Number,
  termsAndConditionsVersion: String
}, { timestamps: true });

module.exports = mongoose.models[TABLENAME] ?
  mongoose.model(TABLENAME) :
  mongoose.model(TABLENAME, SettingSchema);
