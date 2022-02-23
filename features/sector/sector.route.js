let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let sectorHandler = require('./sector-handler');

router.route(`/`).post(verify.verifyAdmin, sectorHandler.addSector);

router.route(`/:sectorId`).put(verify.verifyAdmin, sectorHandler.updateSector);

router.route(`/:sectorId`).delete(verify.verifyAdmin, sectorHandler.deleteSector);

router.route(``).get(verify.verifyUser, sectorHandler.getAllSectors);

module.exports = router;
