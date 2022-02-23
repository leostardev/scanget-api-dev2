let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let promotionHandler = require('./promotion-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, promotionHandler.addPromotion);

router.route(`/:promotionId`).put(verify.verifyAdminOrClientAdmin, promotionHandler.updatePromotion);

router.route(`/:promotionId`).delete(verify.verifyAdminOrClientAdmin, promotionHandler.deletePromotion);

router.route(``).get(verify.verifyUser, promotionHandler.getAllPromotions);

router.route(`/approve`).post(verify.verifyAdmin, promotionHandler.approvePromotion);

router.route(`/reject`).post(verify.verifyAdmin, promotionHandler.rejectPromotion);

router.route(`/get/id`).get(verify.verifyAdminOrClientAdmin, promotionHandler.getPromotionId);

module.exports = router;
