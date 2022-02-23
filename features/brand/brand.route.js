let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let brandHandler = require('./brand-handler');

router.route(`/`).post(verify.verifyAdmin, brandHandler.addBrand);

router.route(`/:brandId`).put(verify.verifyAdmin, brandHandler.updateBrand);

router.route(`/:brandId`).delete(verify.verifyAdmin, brandHandler.deleteBrand);

router.route(``).get(verify.verifyUser, brandHandler.getAllBrands);

module.exports = router;
