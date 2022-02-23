let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityHistoryHandler = require('./community-history-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, communityHistoryHandler.addCommunityHistory);

router.route(`/:communityHistoryId`).put(verify.verifyAdminOrClientAdmin, communityHistoryHandler.updateCommunityHistory);

router.route(`/:communityHistoryId`).delete(verify.verifyAdminOrClientAdmin, communityHistoryHandler.deleteCommunityHistory);

router.route(``).get(verify.verifyUser, communityHistoryHandler.getAllCommunityHistories);

router.route(`/community/:communityId`).get(verify.verifyUser, communityHistoryHandler.getCommunityHistoryByCommunityId);

router.route(`/approve/:communityHistoryId`).get(verify.verifyAdmin, communityHistoryHandler.approveCommunityHistories);

module.exports = router;
