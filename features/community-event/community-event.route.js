let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityEventHandler = require('./community-event-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, communityEventHandler.addCommunityEvent);

router.route(`/:communityEventId`).put(verify.verifyAdminOrClientAdmin, communityEventHandler.updateCommunityEvent);

router.route(`/:communityEventId`).delete(verify.verifyAdminOrClientAdmin, communityEventHandler.deleteCommunityEvent);

router.route(`/:communityEventId`).get(verify.verifyUser, communityEventHandler.getCommunityEventById);

router.route(``).get(verify.verifyUser, communityEventHandler.getAllCommunityEvents);

router.route(`/community/:communityId`).get(verify.verifyUser, communityEventHandler.getCommunityEventsByCommunityId);

router.route(`/users/:communityEventId/csv`).get(verify.verifyAdminOrClientAdmin, communityEventHandler.getCommunityEventIntertedPeopleCSV);

router.route(`/approve/:communityEventId`).get(verify.verifyAdminOrClientAdmin, communityEventHandler.approveCommunityEvents);

router.route(`/activate/:communityEventId`).get(verify.verifyAdminOrClientAdmin, communityEventHandler.activateCommunityEvents);

router.route(`/deactivate/:communityEventId`).get(verify.verifyAdminOrClientAdmin, communityEventHandler.deactivateCommunityEvents);

router.route(`/user/:userId/:communityEventId/add`).get(verify.verifyUser, communityEventHandler.addUserInterestInCommunityEvent);

router.route(`/user/:userId/:communityEventId/remove`).get(verify.verifyUser, communityEventHandler.removeUserInterestInCommunityEvent);

module.exports = router;
