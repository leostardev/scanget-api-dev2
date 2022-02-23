let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityValueHandler = require('./community-value-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, communityValueHandler.addCommunityValue);

router.route(`/:communityValueId`).put(verify.verifyAdminOrClientAdmin, communityValueHandler.updateCommunityValue);

router.route(`/:communityValueId`).delete(verify.verifyAdminOrClientAdmin, communityValueHandler.deleteCommunityValue);

router.route(``).get(verify.verifyUser, communityValueHandler.getAllCommunityValues);

router.route(`/community/:communityId`).get(verify.verifyUser, communityValueHandler.getCommunityValueByCommunityId);

router.route(`/approve/:communityValueId`).get(verify.verifyAdmin, communityValueHandler.approveCommunityValues);

module.exports = router;
