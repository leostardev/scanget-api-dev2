let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let userHandler = require('./user-handler');

router.route(`/me`).get(verify.verifyUser, userHandler.getUserDetails);

router.route(`/me`).put(verify.verifyUser, userHandler.updateUserDetails);

router.route(`/all`).get(verify.verifyAdminOrClientAdmin, userHandler.getAllUsers);

router.route(`/admin`).post(verify.verifyAdmin, userHandler.addAdmin);

router.route(`/admin`).get(verify.verifyAdmin, userHandler.getAllAdmins);

router.route(`/bonus`).post(verify.verifyAdmin, userHandler.rewardBonusToUsers);

router.route(`/bonus/rewardable`).get(verify.verifyAdmin, userHandler.getTopRawardableUsers);

router.route(`/favorite-deal/:userId`).get(verify.verifyUser, userHandler.getUsersFavoriteDeals);

router.route(`/viewed-intro/:userId`).get(verify.verifyUser, userHandler.viewedIntro);

router.route(`/register/push-notification-id`).post(verify.verifyUser, userHandler.registerPushNotificationDevice);

router.route(`/remove/push-notification-id`).post(verify.verifyUser, userHandler.removePushNotificationDevice);

router.route(`/upload/image`).post(verify.verifyUser, userHandler.uploadImageToS3);

router.route(`/csv/get`).get(verify.verifyAdmin, userHandler.exportUsersToCsv);

router.route(`/upload-image/presigned-url`).post(verify.verifyUser, userHandler.getPresignedUrl);

router.route(`/add/manual-points-csv`).post(verify.verifyAdmin, userHandler.addCommunityPointsToUserFromCSV);

router.route(`/get/:userId/history`).get(verify.verifyAdmin, userHandler.getUserHistory);

router.route(`/get/:days/active-users`).get(verify.verifyAdmin, userHandler.getActiveUsers);

router.route(`/mqtt-url`).get(verify.verifyAdmin, userHandler.getMqttUrlForIOTEvents);

module.exports = router;
