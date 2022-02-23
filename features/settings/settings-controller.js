const Boom = require('boom');
const settingDB = require('./settings-model');
const responseMessages = require('../utils/messages');

module.exports.updateSetting = async updateData => {
  try {
    const updatedSetting = await settingDB.updateSetting(updateData);
    return updatedSetting;
  } catch (error) {
    throw Boom.forbidden(responseMessages.setting.ERROR_UPDATING_PRODUCT, error);
  }
}

module.exports.getSettings = async () => {
  try {
    const allSettings = await settingDB.getSettings();
    return allSettings;
  } catch (error) {
    throw Boom.forbidden(responseMessages.setting.ERROR_GETTING_ALL_PRODUCTS, error);
  }
}
