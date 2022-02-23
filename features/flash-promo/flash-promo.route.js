let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let flashPromoHandler = require('./flash-promo-handler');

router.route(`/`).post(verify.verifyAdmin, flashPromoHandler.addFlashPromo);

router.route(`/:flashPromoId`).put(verify.verifyAdmin, flashPromoHandler.updateFlashPromo);

router.route(`/:flashPromoId`).delete(verify.verifyAdmin, flashPromoHandler.deleteFlashPromo);

router.route(`/:flashPromoId`).get(verify.verifyAdmin, flashPromoHandler.getFlashPromoById);

router.route(`/today/get`).get(verify.verifyUser, flashPromoHandler.getTodayFlashPromo);

router.route(``).get(verify.verifyAdmin, flashPromoHandler.getAllFlashPromos);

router.route(`/activate/:flashPromoId`).get(verify.verifyUser, flashPromoHandler.activateFlashPromo);

router.route(`/deactivate/:flashPromoId`).get(verify.verifyUser, flashPromoHandler.deactivateFlashPromo);

module.exports = router;
