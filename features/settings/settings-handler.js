const Boom = require('boom');
const settingCtrl = require('./settings-controller');
const { updateSettingSchema } = require('../utils/validation');

module.exports.updateSetting = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = updateSettingSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await settingCtrl.updateSetting(body);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getSettings = async (req, res, next) => {
  try {
    const data = await settingCtrl.getSettings();
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getNotificationTypes = async (req, res, next) => {
  try {
    const data = await settingCtrl.getSettings();
    const responseData = { notificationTypes: data.notificationTypes };
    res.json({
      success: true,
      data: responseData
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAppVersion = async (req, res, next) => {
  try {
    const data = await settingCtrl.getSettings();
    res.json({
      success: true,
      data: {
        androidAppVersion: data.androidAppVersion,
        androidBuildVersion: data.androidBuildVersion,
        iosAppVersion: data.iosAppVersion,
        iosBuildVersion: data.iosBuildVersion,
        androidReviewAppVersion: data.androidReviewAppVersion,
        androidReviewAppBuildVersion: data.androidReviewAppBuildVersion,
        iosReviewAppVersion: data.iosReviewAppVersion,
        iosReviewAppBuildVersion: data.iosReviewAppBuildVersion,
        termsAndConditionsVersion: data.termsAndConditionsVersion
      }
    });
  } catch (e) {
    return next(e);
  }
}
