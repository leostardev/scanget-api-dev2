let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let retailerHandler = require('./retailer-handler');

router.route(`/`).post(verify.verifyAdmin, retailerHandler.addRetailer);

router.route(`/:retailerId`).put(verify.verifyAdmin, retailerHandler.updateRetailer);

router.route(`/:retailerId`).delete(verify.verifyAdmin, retailerHandler.deleteRetailer);

router.route(``).get(verify.verifyUser, retailerHandler.getAllRetailers);

router.route(`/shop/:retailerId`).delete(verify.verifyAdmin, retailerHandler.deleteRetailerShop);

module.exports = router;
