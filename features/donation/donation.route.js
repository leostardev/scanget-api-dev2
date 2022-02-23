let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let donationHandler = require('./donation-handler');

router.route(`/`).post(verify.verifyAdmin, donationHandler.addDonation);

router.route(`/:donationId`).put(verify.verifyAdmin, donationHandler.updateDonation);

router.route(`/:donationId`).delete(verify.verifyAdmin, donationHandler.deleteDonation);

router.route(``).get(verify.verifyUser, donationHandler.getAllDonations);

router.route(`/deactivate/:donationId`).get(verify.verifyAdmin, donationHandler.deactivateDonation);

module.exports = router;
