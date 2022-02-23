let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let periodHandler = require('./period-handler');

router.route(`/`).post(verify.verifyAdmin, periodHandler.generatePeriods);

router.route(`/:periodId/deactivate`).get(verify.verifyAdmin, periodHandler.deactivatePeriod);

router.route(`/:periodId/activate`).get(verify.verifyAdmin, periodHandler.activatePeriod);

router.route(`/`).get(verify.verifyAdminOrClientAdmin, periodHandler.getAllPeriods);

router.route(`/available`).get(verify.verifyAdminOrClientAdmin, periodHandler.getAllAvailablePeriods);

module.exports = router;
