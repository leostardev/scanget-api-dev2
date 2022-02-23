const strFormat = require('string-template');
const notifications = require('./notification-list');
const notificationCtrl = require('../../notification/notification-controller');

const formatNotification = (data, dType, meta) => {
  const notificationData = { ...notifications[dType] };
  notificationData.title = strFormat(notificationData.title, { ...data, ...meta });
  notificationData.description = strFormat(notificationData.description, { ...data, ...meta });
  const notificationContent = {
    ...notificationData,
    user: data.user,
    meta,
    dType
  };
  return notificationContent;
}
module.exports.formatNotification = formatNotification;

module.exports.sendNotification = (data, dType, meta = {}) => {
  const notification = formatNotification(data, dType, meta);
  return notificationCtrl.createNotification(notification);
}

