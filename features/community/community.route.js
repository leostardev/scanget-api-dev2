let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityHandler = require('./community-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, communityHandler.createCommunity);

router.route(`/:communityId`).put(verify.verifyAdminOrClientAdmin, communityHandler.updateCommunity);

router.route(`/:communityId`).delete(verify.verifyAdminOrClientAdmin, communityHandler.deleteCommunity);

router.route(``).get(verify.verifyUser, communityHandler.getAllCommunities);

router.route(`/:communityId`).get(verify.verifyUser, communityHandler.getCommunityById);

router.route(`/short-id/:communitySid`).get(verify.verifyAdminOrClientAdmin, communityHandler.getCommunityByShortId);

router.route(`/client/:clientId`).get(verify.verifyUser, communityHandler.getCommunityByClientId);

router.route(`/approve/:communityId`).get(verify.verifyAdmin, communityHandler.approveCommunity);

router.route(`/activate/:communityId`).get(verify.verifyAdmin, communityHandler.activateCommunity);

router.route(`/deactivate/:communityId`).get(verify.verifyAdmin, communityHandler.deactivateCommunity);

module.exports = router;
