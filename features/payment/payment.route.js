let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let paymentHandler = require('./payment-handler');

router.route(`/`).get(verify.verifyAdmin, paymentHandler.getAllPayments);

module.exports = router;
