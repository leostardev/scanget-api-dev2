let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let communityProductHandler = require('./community-product-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, communityProductHandler.addCommunityProduct);

router.route(`/:communityProductId`).put(verify.verifyAdminOrClientAdmin, communityProductHandler.updateCommunityProduct);

router.route(`/:communityProductId`).delete(verify.verifyAdminOrClientAdmin, communityProductHandler.deleteCommunityProduct);

router.route(`/:communityProductId`).get(verify.verifyUser, communityProductHandler.getCommunityProductById);

router.route(``).get(verify.verifyUser, communityProductHandler.getAllCommunityProducts);

router.route(`/community/:communityId`).get(verify.verifyUser, communityProductHandler.getCommunityProductsByCommunityId);

router.route(`/approve/:communityProductId`).get(verify.verifyAdmin, communityProductHandler.approveCommunityProducts);

router.route(`/activate/:communityProductId`).get(verify.verifyAdminOrClientAdmin, communityProductHandler.activateCommunityProducts);

router.route(`/deactivate/:communityProductId`).get(verify.verifyAdminOrClientAdmin, communityProductHandler.deactivateCommunityProducts);

module.exports = router;
