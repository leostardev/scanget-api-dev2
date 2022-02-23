let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let settingsHandler = require('./settings-handler');

router.route(`/`).put(verify.verifyAdmin, settingsHandler.updateSetting);

router.route(`/`).get(verify.verifyUser, settingsHandler.getSettings);

router.route(`/notification-types`).get(verify.verifyAdminOrClientAdmin, settingsHandler.getNotificationTypes);

router.route(`/app-version`).get(settingsHandler.getAppVersion);

module.exports = router;
