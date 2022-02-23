let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let packageHandler = require('./package-handler');

router.route(`/`).post(verify.verifyAdmin, packageHandler.createPackage);

router.route(`/:packageId`).put(verify.verifyAdmin, packageHandler.updatePackage);

router.route(`/:packageId/deactivate`).get(verify.verifyAdmin, packageHandler.deactivatePackage);

router.route(`/:packageId/activate`).get(verify.verifyAdmin, packageHandler.activatePackage);

router.route(``).get(verify.verifyAdminOrClientAdmin, packageHandler.getAllPackages);

module.exports = router;
