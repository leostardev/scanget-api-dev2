let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let dashboardHandler = require('./dashboard-handler');

router.route(`/overall-status`).post(verify.verifyAdminOrClientAdmin, dashboardHandler.getOverallStatus);

router.route(`/summary-1`).post(verify.verifyAdminOrClientAdmin, dashboardHandler.getDashboardDatav1);

router.route(`/summary-2`).post(verify.verifyAdminOrClientAdmin, dashboardHandler.getDashboardDatav2);

module.exports = router;
