const SettingSchema = require('./settings-schema');

module.exports.updateSetting = updateSettingData => {
  return new Promise((resolve, reject) => {
    SettingSchema.findOne({}, (err1, data) => { // eslint-disable-line
      if (!data) {
        SettingSchema.create(updateSettingData, (err, createdSettings) => {
          if (err) {
            return reject(err);
          }
          return resolve(createdSettings);
        });
      }

      SettingSchema.findOneAndUpdate({}, updateSettingData, { new: true }).exec((err, updatedSetting) => {
        if (err) {
          reject(err);
        }
        resolve(updatedSetting);
      });
    });
  });
}

module.exports.getSettings = () => {
  return new Promise((resolve, reject) => {
    SettingSchema.findOne({}).lean().exec((err, allSettings) => {
      if (err) {
        reject(err);
      }
      resolve(allSettings);
    });
  });
}
