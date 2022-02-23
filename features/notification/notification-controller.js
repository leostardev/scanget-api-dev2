const Boom = require('boom');
// const config = require('../../config');
const notificationDB = require('./notification-model');
const responseMessages = require('../utils/messages');
const notifications = require('../utils/notification/notification-list');
const userDB = require('../user/user-model');
const ClientSchema = require('../client/client-schema'); // eslint-disable-line

module.exports.createNotification = async (body) => {
  try {
    const notificationData = body;
    if (!notificationData.notificationType) {
      notificationData.notificationType = notifications[notificationData.dType];
    }
    notificationData.forAllUsers = notificationData.sendToAllUsers ? notificationData.sendToAllUsers : false;
    const data = await notificationDB.createNotification(notificationData);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.notification.ERR_CREATING_NOTIFICATION);
  }
}

module.exports.readNotification = async (notificationId, cognitoId) => {
  try {
    const user = await userDB.getUserByCognitoId(cognitoId, false);
    const data = await notificationDB.readNotification(notificationId, user);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.notification.ERR_MARKING_READ);
  }
}

module.exports.getAllUserNotifications = async (params) => {
  try {
    const { user } = params;
    const userData = await userDB.findByMongoId(user);
    const data = await notificationDB.getAllUserNotifications(user, userData.createdAt);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.notification.ERROR_GETTING_ALL_NOTIFICATIONS);
  }
}

module.exports.readAllNotifications = async (params) => {
  try {
    const { user } = params;
    await notificationDB.readAllNotifications(user);
    return;
  } catch (error) {
    throw Boom.forbidden(responseMessages.notification.ERROR_GETTING_ALL_NOTIFICATIONS);
  }
}

module.exports.sendNotificationToUserFromCSV = (notificationData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = notificationData.user;
      if (notificationData.pushNotification) {
        let pushIds = await userDB.getSpecificUserIdsForPushNotification(user);
        await notificationDB.sendPushNofification(pushIds, notificationData.description);
      }
      const inAppnotificationData = {
        user: [notificationData.user],
        description: notificationData.description,
        pushNotification: notificationData.pushNotification,
        notificationType: notifications[notificationData.dType]
      }
      const data = await notificationDB.createNotification(inAppnotificationData);
      resolve(data);
    } catch (error) {
      reject(error)
    }
  })

}

// module.exports.sendSNSNotification = async (data) => {
//   try {
//     const parameters = {
//       Message: JSON.stringify({
//         data
//       }),
//       TopicArn: config.notificationSNSArn
//     };
//     const publishedData = await notificationDB.publishNotificationToSNS(parameters);
//     return publishedData;
//   } catch (error) {
//     throw Boom.forbidden(responseMessages.notification.ERR_SENDING_SNS_NOTIFICATION);
//   }
// }

module.exports.getAllNotificationsAdmin = async (params) => {
  try {
    const data = await notificationDB.getAllNotificationsAdmin(params);
    return data;
  } catch (error) {
    throw Boom.forbidden(responseMessages.notification.ERROR_GETTING_ALL_NOTIFICATIONS);
  }
}

module.exports.sendPushNotifications = async (userIds, message) => {
  try {
    await notificationDB.sendPushNofification(userIds, message);
    return;
  } catch (error) {
    throw Boom.forbidden(responseMessages.notification.ERROR_SENDING_PUSH_NOTIFICATIONS, error);
  }
}
