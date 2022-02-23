let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let clientHandler = require('./client-handler');

router.route(`/`).post(verify.verifyAdmin, clientHandler.createClient);

router.route(`/deactivate`).post(verify.verifyAdmin, clientHandler.deactivateClient);

router.route(`/activate`).post(verify.verifyAdmin, clientHandler.activateClient);

router.route(`/:clientId/create-user`).post(verify.verifyAdminOrClientAdmin, clientHandler.createClientUser);

router.route(`/:clientId/remove-user`).post(verify.verifyAdminOrClientAdmin, clientHandler.removeClientUser);

router.route(`/:clientId`).put(verify.verifyAdminOrClientAdmin, clientHandler.updateClientDetails);

router.route(`/all`).get(verify.verifyAdminOrClientAdmin, clientHandler.getAllClients);

router.route(`/app/all`).get(verify.verifyUser, clientHandler.getAllClientsForApp);

module.exports = router;
