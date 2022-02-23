let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityPointsHandler = require('./community-points-handler');

router.route(`/:family`).get(verify.verifyUser, communityPointsHandler.getAllCommunityPointsByFamilyId);

router.route(`/redeem`).post(verify.verifyAdmin, communityPointsHandler.redeemCommunityPoints);

router.route(`/manual-add`).post(verify.verifyAdmin, communityPointsHandler.manualCommunityPointsEntry);

router.route(`/get-duplicated`).post(verify.verifyAdmin, communityPointsHandler.getDuplicateAdjustedPoints);

router.route(`/remove-duplicated`).post(verify.verifyAdmin, communityPointsHandler.removeDuplicateAdjustedPoints);

router.route(`/summary/:month/:year`).get(verify.verifyAdminOrClientAdmin, communityPointsHandler.getCommunityPointsSummary);

router.route(`/summary-csv/:month/:year`).get(verify.verifyAdminOrClientAdmin, communityPointsHandler.getCommunityPointsSummaryCSV);

router.route(`/csv/all`).get(verify.verifyAdmin, communityPointsHandler.getAllCommunityPointsCSV);

module.exports = router;
