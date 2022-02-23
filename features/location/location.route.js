let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let locationHandler = require('./location-handler');

router.route(`/`).post(verify.verifyAdmin, locationHandler.addLocation);

router.route(`/:locationId`).put(verify.verifyAdmin, locationHandler.updateLocation);

router.route(`/:locationId`).delete(verify.verifyAdmin, locationHandler.deleteLocation);

router.route(``).get(locationHandler.getAllLocations);

module.exports = router;
