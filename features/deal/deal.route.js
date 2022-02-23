let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let dealHandler = require('./deal-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, dealHandler.addDeal);

router.route(`/:dealId`).put(verify.verifyAdminOrClientAdmin, dealHandler.editDeal);

router.route(`/:dealId`).delete(verify.verifyAdminOrClientAdmin, dealHandler.deleteDeal);

router.route(`/`).get(verify.verifyUser, dealHandler.getAllDeals);

router.route(`/csv/get`).get(verify.verifyAdmin, dealHandler.exportDealsToCsv);

router.route(`/flash`).post(verify.verifyUser, dealHandler.getTodayFlashDeal);

router.route(`/similar`).post(verify.verifyUser, dealHandler.getSimilarDeals);

router.route(`/product`).post(verify.verifyUser, dealHandler.getDealsRealtedToProducts);

router.route(`/:dealId`).get(verify.verifyUser, dealHandler.getDealById);

router.route(`/get/id`).get(verify.verifyAdminOrClientAdmin, dealHandler.getDealId);

router.route(`/approve`).post(verify.verifyAdmin, dealHandler.approveDeal);

router.route(`/reject`).post(verify.verifyAdmin, dealHandler.rejectDeal);

router.route(`/deactivate`).post(verify.verifyAdminOrClientAdmin, dealHandler.deactivateDeal);

router.route(`/get/max-weight`).get(verify.verifyAdminOrClientAdmin, dealHandler.getCurrentMaximumWeight);

module.exports = router;
