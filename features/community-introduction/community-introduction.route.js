let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityIntroductionHandler = require('./community-introduction-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, communityIntroductionHandler.addCommunityIntroduction);

router.route(`/:communityIntroductionId`).put(verify.verifyAdminOrClientAdmin, communityIntroductionHandler.updateCommunityIntroduction);

router.route(`/:communityIntroductionId`).delete(verify.verifyAdminOrClientAdmin, communityIntroductionHandler.deleteCommunityIntroduction);

router.route(``).get(verify.verifyUser, communityIntroductionHandler.getAllCommunityIntroduction);

router.route(`/community/:communityId`).get(verify.verifyUser, communityIntroductionHandler.getCommunityIntroductionByCommunityId);

router.route(`/approve/:communityIntroductionId`).get(verify.verifyAdmin, communityIntroductionHandler.approveCommunityIntroduction);

module.exports = router;
