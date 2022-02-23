let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let familyHandler = require('./family-handler');

router.route(`/:familyId/admin`).put(verify.verifyUser, familyHandler.updateFamilyAdmin);

router.route(``).get(verify.verifyAdmin, familyHandler.getAllFamilies);

router.route(`/:familyId/leave`).put(verify.verifyUser, familyHandler.leaveFamily);

router.route(`/:familyId`).get(verify.verifyUser, familyHandler.getFamilyById);

router.route(`/:familyId`).put(verify.verifyUser, familyHandler.updateFamilyDetails);

router.route(`/account-details/all`).get(verify.verifyAdmin, familyHandler.getAllAccountDetails);

router.route(`/account-details/all/csv`).get(verify.verifyAdmin, familyHandler.getAllAccountDetailsCSV);

module.exports = router;
