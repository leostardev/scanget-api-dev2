const mongoose = require('mongoose');
const config = require('../../config')
const NotificationSchema = require('./notification-schema');
const userSchema = require('../user/user-schema'); // eslint-disable-line
const oneSignal = require('onesignal')(config.oneSignalApiKey, config.oneSignalAppId, true);

const AWS = require('aws-sdk');
const AWS_SNS = new AWS.SNS();

module.exports.createNotification = (data) => {
  const notification = new NotificationSchema(data);
  return new Promise((resolve, reject) => {
    notification.save((err, createdNotification) => {
      if (err) {
        reject(err);
      }
      NotificationSchema.findById(createdNotification._id).populate('user').lean().exec((err2, populatedNotification) => {
        if (err2) {
          reject(err2);
        } else {
          resolve(populatedNotification);
        }
      });
    });
  });
}

module.exports.readNotification = (notificationId, readBy) => {
  const readAt = new Date();
  const readData = {
    readAt,
    user: readBy._id
  };
  return new Promise((resolve, reject) => {
    NotificationSchema.findOneAndUpdate({ _id: notificationId, 'readBy.user': { $ne: readBy } }, { $push: { readBy: readData } }, { new: true }, (err, updatedNotification) => {
      if (err) {
        reject(err);
      }
      resolve(updatedNotification);
    });
  });
}

module.exports.getAllUserNotifications = (user, createdAt) => {
  return new Promise((resolve, reject) => {
    NotificationSchema.find({ $or: [{ user }, { forAllUsers: true, createdAt: { $gte: createdAt } }] }).sort({ createdAt: -1 }).limit(50).lean().exec((err, allNotifications) => {
      if (err) {
        reject(err);
      }
      NotificationSchema.count({ $or: [{ 'readBy.user': { $ne: mongoose.Types.ObjectId(user) }, user }, { 'readBy.user': { $ne: mongoose.Types.ObjectId(user) }, forAllUsers: true, createdAt: { $gte: createdAt } }] }, (err2, count) => {
        if (err2) {
          reject(err2);
        }
        allNotifications = allNotifications.map((notification) => { // eslint-disable-line
          if (notification.readBy && notification.readBy.length > 0) {
            for (let i = 0; i < notification.readBy.length; i++) {
              if (notification.readBy[i] && notification.readBy[i].user.toString() === user.toString()) {
                notification.read = true;
                return notification;
              }
            }
            notification.read = false;
            return notification;
          }
          notification.read = false;
          return notification;
        });
        resolve({
          unreadCount: count,
          notifications: allNotifications
        });
      });
    });
  });
}

module.exports.getAllNotificationsAdmin = (params) => {
  const searchText = params.search;
  const query = {};
  let filterTextQuery = {};
  if (params.notificationType) {
    query.notificationType = params.notificationType
  }
  if (params.user) {
    query.user = mongoose.Types.ObjectId(params.user)
  }

  if (searchText) {
    filterTextQuery = {
      $or: [
        { 'title': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'description': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'user.username': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'user.email': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'meta.receiptId': { $regex: `.*${searchText}.*`, $options: '-i' } },
        { 'meta.dealId': { $regex: `.*${searchText}.*`, $options: '-i' } },
      ]
    }
  }
  let limit = parseInt(params.limit || 20);
  let skip = parseInt((params.skip || 0) * limit);
  console.log(limit);
  console.log(skip);
  return new Promise((resolve, reject) => {
    NotificationSchema.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      // {
      //   $unwind: '$user'
      // },
      // {
      //   $unwind: { 
      //     path: '$user', 
      //     preserveNullAndEmptyArrays: true
      //   },
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'readBy.user',
      //     foreignField: '_id',
      //     as: 'readBy.user'
      //   }
      // },
      // {
      //   $unwind: {
      //     path: '$readBy.user',
      //     preserveNullAndEmptyArrays: true
      //   },
      // },
      {
        $match: filterTextQuery
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          '_id': 1,
          'user._id': 1,
          'user.username': 1,
          'user.email': 1,
          'meta': 1,
          'forAllUsers': 1,
          'title': 1,
          'description': 1,
          'notificationType': 1,
          'createdAt': 1,
          'updatedAt': 1,
          'readBy': 1,
          'pushNotification': 1
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          data: {
            $push: '$$ROOT'
          }
        }
      },
      {
        $project: {
          total: 1,
          _id: 0,
          data: {
            $slice: ['$data', skip, limit]
          }
        }
      }
    ])
      .allowDiskUse(true)
      .exec((err, allNotifications) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        resolve(allNotifications && allNotifications.length > 0 ? allNotifications[0] : { total: 0, data: [] });
      });
  });
}

module.exports.readAllNotifications = (user) => {
  const readAt = new Date();
  const readData = {
    readAt,
    user
  };
  const query = {
    $or: [
      {
        user,
        'readBy.user': {
          $ne: user
        }
      },
      {
        forAllUsers: true,
        'readBy.user': {
          $ne: user
        }
      }
    ]
  };
  return new Promise((resolve, reject) => {
    NotificationSchema.update(query, { $push: { readBy: readData } }, { multi: true }, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

module.exports.publishNotificationToSNS = (parameters) => {
  return new Promise((resolve, reject) => { // eslint-disable-line
    AWS_SNS.publish(parameters, (err, data) => { // eslint-disable-line
      if (err) {
        console.log(JSON.stringify(err));
        return reject(err);
      }
      resolve(data);
    });
  });
}

module.exports.sendPushNofification = (userIds, message) => {
  return oneSignal.createNotification(
    message,
    {},
    userIds
  );
}

module.exports.getAllNotificationWithKeyword = (keyword) => {
  return new Promise((resolve, reject) => { // eslint-disable-line
    NotificationSchema.find({ description: { $regex: `.*${keyword}.*`, $options: '-i' } }, (err, data) => { // eslint-disable-line
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

module.exports.deleteNotification = (query) => {
  return new Promise((resolve, reject) => {
    NotificationSchema.findOneAndRemove(query, (err, deletedNotification) => {
      if (err) {
        reject(err);
      }
      resolve(deletedNotification);
    });
  });
}
