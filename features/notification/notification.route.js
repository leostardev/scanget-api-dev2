let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let notificationHandler = require('./notification-handler');

router.route(`/:user`).get(verify.verifyUser, notificationHandler.getAllUserNotifications);

router.route(`/read/:notificationId`).get(verify.verifyUser, notificationHandler.readNotification);

router.route(`/user/:user`).get(verify.verifyUser, notificationHandler.readAllNotifications);

router.route(`/`).post(verify.verifyAdmin, notificationHandler.createNotification);

router.route(`/send-bulk`).post(verify.verifyAdmin, notificationHandler.createBulkNotifications);

router.route(`/admin`).post(verify.verifyAdmin, notificationHandler.getAllNotificationsAdmin);

module.exports = router;
