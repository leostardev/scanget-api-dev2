let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let clientPackageHandler = require('./client-package-handler');

router.route(`/`).post(verify.verifyAdminOrClientAdmin, clientPackageHandler.requestClientPackage);

router.route(`/approve`).post(verify.verifyAdmin, clientPackageHandler.approveClientPackage);

router.route(`/reject`).delete(verify.verifyAdmin, clientPackageHandler.rejectClientPackage);

router.route(`/all`).get(verify.verifyAdminOrClientAdmin, clientPackageHandler.getAllClientPackages);

module.exports = router;
