let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityPeopleHandler = require('./community-people-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, communityPeopleHandler.addCommunityPeople);

router.route(`/:communityPeopleId`).put(verify.verifyAdminOrClientAdmin, communityPeopleHandler.updateCommunityPeople);

router.route(`/:communityPeopleId`).delete(verify.verifyAdminOrClientAdmin, communityPeopleHandler.deleteCommunityPeople);

router.route(``).get(verify.verifyUser, communityPeopleHandler.getAllCommunityPeople);

router.route(`/community/:communityId`).get(verify.verifyUser, communityPeopleHandler.getCommunityPeopleByCommunityId);

router.route(`/approve/:communityPeopleId`).get(verify.verifyAdmin, communityPeopleHandler.approveCommunityPeoples);

module.exports = router;
