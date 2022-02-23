let express = require('express');
let router = express.Router();
let verify = require('../../common/verify');
let inviteHandler = require('./invite-handler');

router.route(`/`).post(verify.verifyUser, inviteHandler.createInviteCode);

router.route(`/accept`).post(verify.verifyUser, inviteHandler.acceptInvite);

router.route(`/all`).get(verify.verifyUser, inviteHandler.getAllInvites);

module.exports = router;
