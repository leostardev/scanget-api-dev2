const Boom = require('boom');
const notificationCtrl = require('./notification-controller');
const { readNotificationSchema, getAllUserNotificationsSchema, createNotificationSchema, createBulkNotificationSchema, createBulkNotificationItemSchema, getAllUserNotificationsAdminSchema } = require('../utils/validation');
const userDb = require('../user/user-model');

module.exports.readNotification = async (req, res, next) => {
  try {
    const { params, currentUser } = req;
    const { notificationId } = params;
    const validationError = readNotificationSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await notificationCtrl.readNotification(notificationId, currentUser.cognitoId);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllUserNotifications = async (req, res, next) => {
  try {
    const { params } = req;
    const validationError = getAllUserNotificationsSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await notificationCtrl.getAllUserNotifications(params);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

// module.exports.createNotificationSNS = async (req, res, next) => {
//   try {
//     const { message } = parseSNSEvent(event);
//     message.data.user = [message.data.user];
//     const data = await notificationCtrl.createNotification(message.data);
//     res.json({
//       success: true,
//       data
//     });
//   } catch (e) {
//     return next(e);
//   }
// }

module.exports.createNotification = async (req, res, next) => {
  try {
    const { body } = req;
    const validationError = createNotificationSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    if (body.pushNotification) {
      let pushIds = [];
      if (body.sendToAllUsers) {
        pushIds = await userDb.getAllUserIdsForPushNotification();
      } else {
        pushIds = await userDb.getSpecificUserIdsForPushNotification(body.user);
      }
      console.log(pushIds);
      try {
        await notificationCtrl.sendPushNotifications(pushIds, body.description);
      } catch (error) {
        console.log(error);
      }
    }
    const data = await notificationCtrl.createNotification(body);
    // if (!body.sendToAllUsers) {
    //   const $promises = [];
    //   for (let i = 0; i < body.users.length; i++) {
    //     const notification = { ...body };
    //     delete notification.users;
    //     notification.user = body.users[i];
    //     $promises.push(notificationCtrl.createNotification(body));
    //   }
    //   data = await Promise.all($promises);
    // } else {
    // }
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.createBulkNotifications = async (req, res, next) => {
  try {
    const { body } = req;
    const { notificationData } = body;
    const validNotificationData = [];
    const invalidNotificationData = [];
    let validationError = createBulkNotificationSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    for (let i = 0; i < notificationData.length; i++) {
      validationError = createBulkNotificationItemSchema(notificationData[i])
      if (validationError) {
        invalidNotificationData.push({ ...notificationData[i], validationError })
      } else {
        validNotificationData.push(notificationData[i])
      }
    }

    const $promises = [];
    for (let j = 0; j < validNotificationData.length; j++) {
      $promises.push(notificationCtrl.sendNotificationToUserFromCSV(validNotificationData[j]))
    }
    await Promise.all($promises);
    res.json({
      success: true,
      data: {
        sentNotifications: validNotificationData,
        failedNotifications: invalidNotificationData
      }
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.readAllNotifications = async (req, res, next) => {
  try {
    const { params } = req;
    const validationError = getAllUserNotificationsSchema(params);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await notificationCtrl.readAllNotifications(params);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}

module.exports.getAllNotificationsAdmin = async (req, res, next) => {
  try {
    const { body, queryParams } = req;
    const validationError = getAllUserNotificationsAdminSchema(body);
    if (validationError) {
      throw Boom.badRequest(validationError);
    }
    const data = await notificationCtrl.getAllNotificationsAdmin(body, queryParams.page);
    res.json({
      success: true,
      data
    });
  } catch (e) {
    return next(e);
  }
}
